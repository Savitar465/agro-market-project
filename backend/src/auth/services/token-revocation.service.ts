import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class TokenRevocationService implements OnModuleInit, OnModuleDestroy {
  private revoked = new Map<string, number>(); // token => exp (unix seconds)
  private timer?: NodeJS.Timeout;

  onModuleInit() {
    // prune every minute
    this.timer = setInterval(() => this.prune(), 60_000);
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  revoke(token: string, exp?: number) {
    const now = Math.floor(Date.now() / 1000);
    const expiry = exp && exp > now ? exp : now + 3600; // default 1 hour if exp not provided
    this.revoked.set(token, expiry);
  }

  isRevoked(token: string): boolean {
    const exp = this.revoked.get(token);
    if (!exp) return false;
    const now = Math.floor(Date.now() / 1000);
    if (exp < now) {
      this.revoked.delete(token);
      return false;
    }
    return true;
  }

  private prune() {
    const now = Math.floor(Date.now() / 1000);
    for (const [token, exp] of this.revoked.entries()) {
      if (exp < now) this.revoked.delete(token);
    }
  }
}
