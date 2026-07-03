/**
 * àjó Real API Service
 * Makes actual HTTP requests to the FastAPI backend using the shared app contract.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    AdminDecisionRequest,
    AdminVerificationQueueItem,
    CircleCreate,
    CircleOut,
    ContributionCreate,
    ContributionOut,
    FundWalletRequest,
    FundWalletResponse,
    InviteCreate,
    InviteOut,
    InvitePreview,
    JoinRequestOut,
    LoginRequest,
    MarkPayoutPaidRequest,
    MembershipOut,
    NotificationOut,
    PinVerifyRequest,
    SignupRequest,
    TokenResponse,
    TransactionOut,
    UserOut,
    UserUpdateRequest,
    VerificationDocOut,
    VerificationSubmitRequest,
    WalletOut,
    WithdrawRequest,
} from './api.types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://ajo-tqfb.onrender.com';
const SESSION_STORAGE_KEY = 'ajó-session';

interface StoredSession {
  accessToken: string;
  user: UserOut;
  expiresAt: string;
}

class RealApiService {
  private accessToken: string | null = null;
  private user: UserOut | null = null;

  constructor() {
    this.restoreSession().catch(() => undefined);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({ detail: 'Request failed' }));
      const message =
        (typeof body?.detail === 'string' && body.detail) ||
        (typeof body?.message === 'string' && body.message) ||
        'Request failed';
      throw new Error(message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  async restoreSession(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as StoredSession;
      if (!parsed.accessToken || !parsed.user) return;

      const expiresAt = new Date(parsed.expiresAt).getTime();
      if (expiresAt && Date.now() > expiresAt) {
        await this.clearSession();
        return;
      }

      this.accessToken = parsed.accessToken;
      this.user = parsed.user;
    } catch {
      await this.clearSession();
    }
  }

  private async persistSession(accessToken: string, user: UserOut): Promise<void> {
    this.accessToken = accessToken;
    this.user = user;

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await AsyncStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ accessToken, user, expiresAt }),
    );
  }

  async clearSession(): Promise<void> {
    this.accessToken = null;
    this.user = null;
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
  }

  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await this.request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    await this.persistSession(response.access_token, response.user);
    return response;
  }

  async signup(data: SignupRequest): Promise<TokenResponse> {
    const response = await this.request<TokenResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    await this.persistSession(response.access_token, response.user);
    return response;
  }

  async verifyPin(data: PinVerifyRequest): Promise<void> {
    await this.request('/auth/verify-pin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<UserOut> {
    return this.request<UserOut>('/users/me');
  }

  async updateMe(data: UserUpdateRequest): Promise<UserOut> {
    return this.request<UserOut>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async listMyVerificationDocs(): Promise<VerificationDocOut[]> {
    return this.request<VerificationDocOut[]>('/users/me/verification');
  }

  async submitVerification(data: VerificationSubmitRequest): Promise<VerificationDocOut> {
    return this.request<VerificationDocOut>('/users/me/verification', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listVerificationQueue(): Promise<AdminVerificationQueueItem[]> {
    return this.request<AdminVerificationQueueItem[]>('/admin/verification-queue');
  }

  async approveVerification(userId: number, data: AdminDecisionRequest): Promise<UserOut> {
    return this.request<UserOut>(`/admin/verification/${userId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async rejectVerification(userId: number, data: AdminDecisionRequest): Promise<UserOut> {
    return this.request<UserOut>(`/admin/verification/${userId}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listCircles(filter?: string | null, search?: string | null): Promise<CircleOut[]> {
    const params = new URLSearchParams();
    if (filter) {
      params.set('frequency', filter);
    }
    if (search) {
      params.set('search', search);
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<CircleOut[]>(`/circles${query}`);
  }

  async createCircle(data: CircleCreate): Promise<CircleOut> {
    return this.request<CircleOut>('/circles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCircle(circleId: number): Promise<CircleOut> {
    return this.request<CircleOut>(`/circles/${circleId}`);
  }

  async listMembers(circleId: number): Promise<MembershipOut[]> {
    return this.request<MembershipOut[]>(`/circles/${circleId}/members`);
  }

  async requestToJoin(circleId: number): Promise<MembershipOut> {
    return this.request<MembershipOut>(`/circles/${circleId}/join`, {
      method: 'POST',
    });
  }

  async listJoinRequests(circleId: number): Promise<JoinRequestOut[]> {
    return this.request<JoinRequestOut[]>(`/circles/${circleId}/join-requests`);
  }

  async approveJoinRequest(circleId: number, userId: number): Promise<MembershipOut> {
    return this.request<MembershipOut>(`/circles/${circleId}/join-requests/${userId}/approve`, {
      method: 'POST',
    });
  }

  async denyJoinRequest(circleId: number, userId: number): Promise<void> {
    await this.request(`/circles/${circleId}/join-requests/${userId}/deny`, {
      method: 'POST',
    });
  }

  async listContributions(circleId: number): Promise<ContributionOut[]> {
    return this.request<ContributionOut[]>(`/circles/${circleId}/contributions`);
  }

  async makeContribution(circleId: number, data: ContributionCreate): Promise<ContributionOut> {
    return this.request<ContributionOut>(`/circles/${circleId}/contributions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markPayoutPaid(circleId: number, userId: number, data: MarkPayoutPaidRequest): Promise<void> {
    await this.request(`/circles/${circleId}/payouts/${userId}/mark-paid`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWallet(): Promise<WalletOut> {
    return this.request<WalletOut>('/wallet');
  }

  async fundWallet(data: FundWalletRequest): Promise<FundWalletResponse> {
    return this.request<FundWalletResponse>('/wallet/fund', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async withdraw(data: WithdrawRequest): Promise<TransactionOut> {
    return this.request<TransactionOut>('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listTransactions(): Promise<TransactionOut[]> {
    return this.request<TransactionOut[]>('/wallet/transactions');
  }

  async createInvite(circleId: number, data: InviteCreate): Promise<InviteOut> {
    return this.request<InviteOut>(`/circles/${circleId}/invites`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async previewInvite(code: string): Promise<InvitePreview> {
    return this.request<InvitePreview>(`/invites/${code}`);
  }

  async acceptInvite(code: string): Promise<MembershipOut> {
    return this.request<MembershipOut>(`/invites/${code}/accept`, {
      method: 'POST',
    });
  }

  async listNotifications(): Promise<NotificationOut[]> {
    return this.request<NotificationOut[]>('/notifications');
  }

  async markNotificationRead(notificationId: number): Promise<void> {
    await this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }
}

export const realService = new RealApiService();
