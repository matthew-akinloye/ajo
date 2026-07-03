export interface Circle {
  id: string;
  name: string;
  description?: string;
  currentMembers: number;
  memberCapacity: number;
  amount: number;
  nextPayoutDate?: string;
  status: 'active' | 'completed' | 'pending';
}

export interface Contribution {
  id: string;
  circleId: string;
  userName: string;
  userAvatar?: string;
  amount: number;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'paid';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
