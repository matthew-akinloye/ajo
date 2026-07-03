/**
 * àjó API Types
 * Shared types for both mock and real API services
 * Matches OpenAPI schema from https://ajo-tqfb.onrender.com/openapi.json
 */

// ===== ENUMS =====
export type CircleFrequency = "weekly" | "monthly" | "biweekly";
export type CircleStatus = "forming" | "active" | "completed";
export type PayoutOrderType = "random" | "sequential";
export type ContributionStatus = "paid" | "late" | "missed";
export type MembershipStatus = "pending" | "active" | "denied" | "left";
export type TransactionType =
  | "funding"
  | "withdrawal"
  | "contribution"
  | "payout";
export type TransactionStatus = "success" | "pending" | "failed";
export type VerificationStatus =
  | "unverified"
  | "submitted"
  | "verified"
  | "rejected";
export type VerificationDocType = "nin" | "bvn" | "selfie";
export type VerificationDocStatus = "submitted" | "approved" | "rejected";
export type InviteStatus = "waiting" | "accepted" | "expired";

// ===== REQUEST TYPES =====
export interface SignupRequest {
  full_name: string;
  phone: string;
  email?: string | null;
  pin: string;
}

export interface LoginRequest {
  phone: string;
  pin: string;
}

export interface PinVerifyRequest {
  pin: string;
}

export interface UserUpdateRequest {
  full_name?: string | null;
  email?: string | null;
}

export interface CircleCreate {
  name: string;
  contribution_amount: number;
  frequency?: CircleFrequency;
  member_capacity?: number;
  payout_order?: PayoutOrderType;
  open_join?: boolean;
}

export interface ContributionCreate {
  pin: string;
}

export interface FundWalletRequest {
  amount: number;
}

export interface WithdrawRequest {
  amount: number;
  pin: string;
  bank_account_number: string;
  bank_code: string;
}

export interface InviteCreate {
  invitee_contact?: string | null;
}

export interface VerificationSubmitRequest {
  type: VerificationDocType;
  value_or_url: string;
}

export interface AdminDecisionRequest {
  reason?: string | null;
}

export interface MarkPayoutPaidRequest {
  pin: string;
}

// ===== RESPONSE TYPES =====
export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserOut;
}

export interface UserOut {
  id: number;
  full_name: string;
  phone: string;
  email?: string | null;
  verification_status: VerificationStatus;
  is_admin: boolean;
  trust_score: number;
  created_at: string;
}

export interface CircleOut {
  id: number;
  name: string;
  created_by: number;
  contribution_amount: number;
  frequency: CircleFrequency;
  member_capacity: number;
  payout_order: PayoutOrderType;
  open_join: boolean;
  status: CircleStatus;
  cycle_goal: number;
  total_saved: number;
  current_turn_index: number;
  created_at: string;
}

export interface MembershipOut {
  id: number;
  circle_id: number;
  user_id: number;
  status: MembershipStatus;
  payout_position: number | null;
  joined_at: string;
}

export interface ContributionOut {
  id: number;
  circle_id: number;
  user_id: number;
  amount: number;
  status: ContributionStatus;
  paid_at: string;
}

export interface WalletOut {
  balance: number;
  total_savings: number;
  active_circles: number;
}

export interface TransactionOut {
  id: number;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  reference?: string | null;
  created_at: string;
}

export interface InviteOut {
  id: number;
  circle_id: number;
  code: string;
  status: InviteStatus;
  created_at: string;
}

export interface InvitePreview {
  circle: CircleOut;
  invited_by: UserOut;
}

export interface NotificationOut {
  id: number;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface VerificationDocOut {
  id: number;
  type: VerificationDocType;
  status: VerificationDocStatus;
  created_at: string;
}

export interface JoinRequestOut {
  membership_id: number;
  user: UserOut;
  ai_summary?: string | null;
  requested_at: string;
}

export interface AdminVerificationQueueItem {
  user: UserOut;
  docs: VerificationDocOut[];
}

export interface FundWalletResponse {
  checkout_url: string;
  reference: string;
}

// ===== LEGACY TYPES (for backward compatibility) =====
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  isVerified: boolean;
  verificationStatus: "none" | "pending" | "verified";
  trustScore: number;
  circlesJoined: number;
  totalSaved: number;
  inviteCode: string;
}

export interface Circle {
  id: string;
  name: string;
  description: string;
  amount: number;
  frequency: "weekly" | "monthly";
  memberCapacity: number;
  currentMembers: number;
  creatorId: string;
  color: string;
  category: "savings" | "investment" | "emergency" | "goals";
  rules: string[];
  createdAt: string;
  nextPayoutDate?: string;
}

export interface Contribution {
  id: string;
  circleId: string;
  userId: string;
  userName: string;
  amount: number;
  timestamp: string;
  status: "paid" | "pending" | "late";
}

export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  type: "funding" | "contribution" | "payout" | "withdrawal";
  amount: number;
  timestamp: string;
  status: "completed" | "pending" | "failed";
  description: string;
}

export interface Invite {
  id: string;
  inviterId: string;
  inviteeEmail?: string;
  inviteePhone?: string;
  status: "pending" | "accepted" | "expired";
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "payout" | "contribution" | "member" | "rules";
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
}

export interface ApiService {
  // Auth
  login(email: string, pin: string): Promise<User>;
  signup(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    pin: string;
  }): Promise<User>;

  // User
  getUser(userId: string): Promise<User>;
  updateUser(userId: string, data: Partial<User>): Promise<User>;
  getTrustNarrative(userId: string): Promise<string>;

  // Circles
  getCircles(): Promise<Circle[]>;
  getCircle(circleId: string): Promise<Circle>;
  createCircle(
    data: Omit<Circle, "id" | "currentMembers" | "createdAt">,
  ): Promise<Circle>;
  joinCircle(circleId: string, userId: string): Promise<Circle>;
  getUserCircles(userId: string): Promise<Circle[]>;

  // Contributions
  getContributions(circleId?: string): Promise<Contribution[]>;
  getCircleContributions(circleId: string): Promise<Contribution[]>;
  createContribution(
    data: Omit<Contribution, "id" | "timestamp">,
  ): Promise<Contribution>;

  // Wallet
  getWallet(userId: string): Promise<Wallet>;
  fundWallet(userId: string, amount: number): Promise<Wallet>;
  withdrawFromWallet(userId: string, amount: number): Promise<Wallet>;

  // Transactions
  getTransactions(userId: string): Promise<Transaction[]>;

  // Invites
  getInvites(userId: string): Promise<Invite[]>;
  createInvite(
    data: Omit<Invite, "id" | "status" | "createdAt">,
  ): Promise<Invite>;

  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(notificationId: string): Promise<void>;
}
