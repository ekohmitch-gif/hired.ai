import { sql } from '@/lib/db';

// Review Engine storage. Following the pattern used in lib/subscribers.ts,
// the tables are created lazily and idempotently behind a memoized promise
// because this app has no migration runner.

let tablesReady: Promise<void> | null = null;

export function ensureReviewEngineTables(): Promise<void> {
  if (!tablesReady) {
    tablesReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS re_shops (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          owner_user_id TEXT UNIQUE NOT NULL,
          business_name TEXT NOT NULL,
          owner_name TEXT,
          owner_email TEXT,
          owner_phone TEXT,
          google_review_url TEXT NOT NULL,
          service_types TEXT,
          baseline_review_count INT NOT NULL DEFAULT 0,
          current_review_count INT NOT NULL DEFAULT 0,
          window_start DATE NOT NULL DEFAULT CURRENT_DATE,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS re_requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          shop_id UUID REFERENCES re_shops(id) ON DELETE CASCADE,
          token TEXT UNIQUE NOT NULL,
          customer_name TEXT NOT NULL,
          customer_phone TEXT,
          job_description TEXT,
          status TEXT NOT NULL DEFAULT 'sent',
          sms_status TEXT,
          created_at TIMESTAMPTZ DEFAULT now(),
          responded_at TIMESTAMPTZ
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS re_feedback (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          shop_id UUID REFERENCES re_shops(id) ON DELETE CASCADE,
          request_id UUID REFERENCES re_requests(id) ON DELETE SET NULL,
          customer_name TEXT,
          message TEXT NOT NULL,
          draft_reply TEXT,
          approved_reply TEXT,
          status TEXT NOT NULL DEFAULT 'new',
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS re_reviews (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          shop_id UUID REFERENCES re_shops(id) ON DELETE CASCADE,
          reviewer_name TEXT,
          rating INT,
          review_text TEXT,
          job_description TEXT,
          draft_reply TEXT,
          approved_reply TEXT,
          status TEXT NOT NULL DEFAULT 'new',
          review_date DATE,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        )
      `;
    })();
    tablesReady.catch(() => {
      tablesReady = null;
    });
  }
  return tablesReady;
}

export interface ShopRow {
  id: string;
  owner_user_id: string;
  business_name: string;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
  google_review_url: string;
  service_types: string | null;
  baseline_review_count: number;
  current_review_count: number;
  window_start: string;
  created_at: string;
  updated_at: string;
}

export interface RequestRow {
  id: string;
  shop_id: string;
  token: string;
  customer_name: string;
  customer_phone: string | null;
  job_description: string | null;
  status: string;
  sms_status: string | null;
  created_at: string;
  responded_at: string | null;
}

export interface FeedbackRow {
  id: string;
  shop_id: string;
  request_id: string | null;
  customer_name: string | null;
  message: string;
  draft_reply: string | null;
  approved_reply: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewRow {
  id: string;
  shop_id: string;
  reviewer_name: string | null;
  rating: number | null;
  review_text: string | null;
  job_description: string | null;
  draft_reply: string | null;
  approved_reply: string | null;
  status: string;
  review_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicRequestRow extends RequestRow {
  business_name: string;
  google_review_url: string;
  owner_name: string | null;
  owner_email: string | null;
}

export interface ShopInput {
  businessName: string;
  ownerName?: string | null;
  ownerEmail?: string | null;
  ownerPhone?: string | null;
  googleReviewUrl: string;
  serviceTypes?: string | null;
  baselineReviewCount?: number;
  currentReviewCount?: number;
}

export async function getShopByOwner(ownerUserId: string): Promise<ShopRow | null> {
  await ensureReviewEngineTables();
  const { rows } = await sql`
    SELECT * FROM re_shops WHERE owner_user_id = ${ownerUserId} LIMIT 1
  `;
  return (rows[0] as ShopRow) || null;
}

export async function upsertShop(ownerUserId: string, input: ShopInput): Promise<ShopRow> {
  await ensureReviewEngineTables();
  const baseline = Math.max(0, Math.floor(input.baselineReviewCount ?? 0));
  const current = Math.max(0, Math.floor(input.currentReviewCount ?? baseline));
  const { rows } = await sql`
    INSERT INTO re_shops (
      owner_user_id, business_name, owner_name, owner_email, owner_phone,
      google_review_url, service_types, baseline_review_count, current_review_count
    )
    VALUES (
      ${ownerUserId}, ${input.businessName}, ${input.ownerName ?? null},
      ${input.ownerEmail ?? null}, ${input.ownerPhone ?? null},
      ${input.googleReviewUrl}, ${input.serviceTypes ?? null},
      ${baseline}, ${current}
    )
    ON CONFLICT (owner_user_id) DO UPDATE SET
      business_name = EXCLUDED.business_name,
      owner_name = EXCLUDED.owner_name,
      owner_email = EXCLUDED.owner_email,
      owner_phone = EXCLUDED.owner_phone,
      google_review_url = EXCLUDED.google_review_url,
      service_types = EXCLUDED.service_types,
      baseline_review_count = EXCLUDED.baseline_review_count,
      current_review_count = EXCLUDED.current_review_count,
      updated_at = now()
    RETURNING *
  `;
  return rows[0] as ShopRow;
}

export async function updateProgress(shopId: string, currentReviewCount: number): Promise<ShopRow | null> {
  await ensureReviewEngineTables();
  const current = Math.max(0, Math.floor(currentReviewCount));
  const { rows } = await sql`
    UPDATE re_shops
    SET current_review_count = ${current}, updated_at = now()
    WHERE id = ${shopId}
    RETURNING *
  `;
  return (rows[0] as ShopRow) || null;
}

export async function createRequest(
  shopId: string,
  input: {
    token: string;
    customerName: string;
    customerPhone?: string | null;
    jobDescription?: string | null;
    smsStatus?: string | null;
  }
): Promise<RequestRow> {
  await ensureReviewEngineTables();
  const { rows } = await sql`
    INSERT INTO re_requests (shop_id, token, customer_name, customer_phone, job_description, sms_status)
    VALUES (${shopId}, ${input.token}, ${input.customerName}, ${input.customerPhone ?? null}, ${input.jobDescription ?? null}, ${input.smsStatus ?? null})
    RETURNING *
  `;
  return rows[0] as RequestRow;
}

export async function updateRequestSmsStatus(
  id: string,
  smsStatus: string
): Promise<RequestRow | null> {
  await ensureReviewEngineTables();
  const { rows } = await sql`
    UPDATE re_requests
    SET sms_status = ${smsStatus}
    WHERE id = ${id}
    RETURNING *
  `;
  return (rows[0] as RequestRow) || null;
}

export async function getRequestByToken(token: string): Promise<PublicRequestRow | null> {
  await ensureReviewEngineTables();
  const { rows } = await sql`
    SELECT r.*, s.business_name, s.google_review_url, s.owner_name, s.owner_email
    FROM re_requests r
    JOIN re_shops s ON s.id = r.shop_id
    WHERE r.token = ${token}
    LIMIT 1
  `;
  return (rows[0] as PublicRequestRow) || null;
}

export async function listRequests(shopId: string): Promise<RequestRow[]> {
  await ensureReviewEngineTables();
  const { rows } = await sql`
    SELECT * FROM re_requests WHERE shop_id = ${shopId} ORDER BY created_at DESC
  `;
  return rows as RequestRow[];
}

export async function markRequestStatus(
  token: string,
  status: 'happy' | 'feedback'
): Promise<RequestRow | null> {
  await ensureReviewEngineTables();
  const { rows } = await sql`
    UPDATE re_requests
    SET status = ${status}, responded_at = now()
    WHERE token = ${token}
    RETURNING *
  `;
  return (rows[0] as RequestRow) || null;
}

export async function addFeedback(input: {
  shopId: string;
  requestId?: string | null;
  customerName?: string | null;
  message: string;
}): Promise<FeedbackRow> {
  await ensureReviewEngineTables();
  const { rows } = await sql`
    INSERT INTO re_feedback (shop_id, request_id, customer_name, message)
    VALUES (${input.shopId}, ${input.requestId ?? null}, ${input.customerName ?? null}, ${input.message})
    RETURNING *
  `;
  return rows[0] as FeedbackRow;
}

export async function listFeedback(shopId: string): Promise<FeedbackRow[]> {
  await ensureReviewEngineTables();
  const { rows } = await sql`
    SELECT * FROM re_feedback WHERE shop_id = ${shopId} ORDER BY created_at DESC
  `;
  return rows as FeedbackRow[];
}

export interface FeedbackWithJobRow extends FeedbackRow {
  job_description: string | null;
}

export async function getFeedbackById(
  id: string,
  shopId: string
): Promise<FeedbackWithJobRow | null> {
  await ensureReviewEngineTables();
  const { rows } = await sql`
    SELECT f.*, r.job_description AS job_description
    FROM re_feedback f
    LEFT JOIN re_requests r ON r.id = f.request_id
    WHERE f.id = ${id} AND f.shop_id = ${shopId}
    LIMIT 1
  `;
  return (rows[0] as FeedbackWithJobRow) || null;
}

export async function addReview(input: {
  shopId: string;
  reviewerName?: string | null;
  rating?: number | null;
  reviewText?: string | null;
  jobDescription?: string | null;
  reviewDate?: string | null;
}): Promise<ReviewRow> {
  await ensureReviewEngineTables();
  const { rows } = await sql`
    INSERT INTO re_reviews (shop_id, reviewer_name, rating, review_text, job_description, review_date)
    VALUES (${input.shopId}, ${input.reviewerName ?? null}, ${input.rating ?? null}, ${input.reviewText ?? null}, ${input.jobDescription ?? null}, ${input.reviewDate ?? null})
    RETURNING *
  `;
  return rows[0] as ReviewRow;
}

export async function listReviews(shopId: string): Promise<ReviewRow[]> {
  await ensureReviewEngineTables();
  const { rows } = await sql`
    SELECT * FROM re_reviews WHERE shop_id = ${shopId} ORDER BY created_at DESC
  `;
  return rows as ReviewRow[];
}

export async function getReviewById(id: string, shopId: string): Promise<ReviewRow | null> {
  await ensureReviewEngineTables();
  const { rows } = await sql`
    SELECT * FROM re_reviews WHERE id = ${id} AND shop_id = ${shopId} LIMIT 1
  `;
  return (rows[0] as ReviewRow) || null;
}

export type ReplyKind = 'review' | 'feedback';

export async function setDraft(
  kind: ReplyKind,
  id: string,
  shopId: string,
  draft: string
): Promise<ReviewRow | FeedbackRow | null> {
  await ensureReviewEngineTables();
  if (kind === 'review') {
    const { rows } = await sql`
      UPDATE re_reviews
      SET draft_reply = ${draft}, status = 'drafted', updated_at = now()
      WHERE id = ${id} AND shop_id = ${shopId}
      RETURNING *
    `;
    return (rows[0] as ReviewRow) || null;
  }
  const { rows } = await sql`
    UPDATE re_feedback
    SET draft_reply = ${draft}, status = 'drafted', updated_at = now()
    WHERE id = ${id} AND shop_id = ${shopId}
    RETURNING *
  `;
  return (rows[0] as FeedbackRow) || null;
}

export async function approveItem(
  kind: ReplyKind,
  id: string,
  shopId: string,
  approvedReply: string
): Promise<ReviewRow | FeedbackRow | null> {
  await ensureReviewEngineTables();
  if (kind === 'review') {
    const { rows } = await sql`
      UPDATE re_reviews
      SET approved_reply = ${approvedReply}, status = 'approved', updated_at = now()
      WHERE id = ${id} AND shop_id = ${shopId}
      RETURNING *
    `;
    return (rows[0] as ReviewRow) || null;
  }
  const { rows } = await sql`
    UPDATE re_feedback
    SET approved_reply = ${approvedReply}, status = 'approved', updated_at = now()
    WHERE id = ${id} AND shop_id = ${shopId}
    RETURNING *
  `;
  return (rows[0] as FeedbackRow) || null;
}
