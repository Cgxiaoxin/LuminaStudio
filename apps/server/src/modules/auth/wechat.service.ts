import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

interface WeChatSession {
  openid: string;
  session_key?: string;
  unionid?: string;
}

@Injectable()
export class WeChatService {
  constructor(private config: ConfigService) {}

  private isDevMode(): boolean {
    const appId = this.config.get<string>('WECHAT_APPID');
    const secret = this.config.get<string>('WECHAT_SECRET');
    return !appId || !secret || appId === 'your-appid' || secret === 'your-secret';
  }

  async codeToSession(code: string): Promise<WeChatSession> {
    if (this.isDevMode()) {
      const openid = `dev_${createHash('sha256').update(code).digest('hex').slice(0, 28)}`;
      return { openid, session_key: 'dev_session_key' };
    }

    const appId = this.config.get<string>('WECHAT_APPID');
    const secret = this.config.get<string>('WECHAT_SECRET');
    const url = new URL('https://api.weixin.qq.com/sns/jscode2session');
    url.searchParams.set('appid', appId!);
    url.searchParams.set('secret', secret!);
    url.searchParams.set('js_code', code);
    url.searchParams.set('grant_type', 'authorization_code');

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.errcode) {
      throw new UnauthorizedException(`WeChat login failed: ${data.errmsg || data.errcode}`);
    }
    if (!data.openid) {
      throw new UnauthorizedException('WeChat login failed: missing openid');
    }

    return {
      openid: data.openid,
      session_key: data.session_key,
      unionid: data.unionid,
    };
  }
}
