/**
 * Auth seam. MVP has no accounts — the NoopAuthProvider represents an anonymous
 * local user. When cloud sync / accounts land, implement this interface (e.g. a
 * SupabaseAuthProvider) and the rest of the app gains a signed-in user without
 * structural changes.
 */
export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthProvider {
  getUser(): Promise<AuthUser | null>;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
}

export class NoopAuthProvider implements AuthProvider {
  getUser(): Promise<AuthUser | null> {
    return Promise.resolve(null);
  }
  signIn(): Promise<void> {
    return Promise.resolve();
  }
  signOut(): Promise<void> {
    return Promise.resolve();
  }
}

export const authProvider: AuthProvider = new NoopAuthProvider();
