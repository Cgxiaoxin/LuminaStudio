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
      // 开发环境统一 demo 账号，与 seed 中 dev_openid_demo 对齐
      return { openid: 'dev_openid_demo', session_key: 'dev_session_key' };
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

  async getPhoneNumber(code: string): Promise<string> {
    if (this.isDevMode()) {
      const suffix = createHash('sha256').update(code).digest('hex').slice(0, 8);
      return `138${suffix.slice(0, 8)}`.slice(0, 11);
    }

    const appId = this.config.get<string>('WECHAT_APPID');
    const secret = this.config.get<string>('WECHAT_SECRET');
    const tokenUrl = new URL('https://api.weixin.qq.com/cgi-bin/token');
    tokenUrl.searchParams.set('grant_type', 'client_credential');
    tokenUrl.searchParams.set('appid', appId!);
    tokenUrl.searchParams.set('secret', secret!);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      throw new UnauthorizedException('Failed to get WeChat access token');
    }

    const phoneUrl = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${tokenData.access_token}`;
    const phoneRes = await fetch(phoneUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const phoneData = await phoneRes.json();
    const phone = phoneData?.phone_info?.phoneNumber;
    if (!phone) {
      throw new UnauthorizedException('Failed to get phone number from WeChat');
    }
    return phone;
  }
}
