import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
require('dotenv').config();
@Injectable()
export class ZoomService {
    private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }
  async getAuthorizationUrl(): Promise<string> {
    const clientId = process.env.ZOOM_CLIENT_ID;
    const redirectUri = 'http://localhost:3000/zoom/callback';
    const responseType = 'code';

    return `https://zoom.us/oauth/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}`;
  }

   async requestAccessToken(code: string, codeVerifier: string): Promise<any> {
        try {
            const clientId = process.env.ZOOM_CLIENT_ID;
            const clientSecret = process.env.ZOOM_CLIENT_SECRET;
            const redirectUri = 'http://localhost:3000/zoom/callback';

            const tokenResponse = await axios.post(
                'https://zoom.us/oauth/token',
                new URLSearchParams({
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: redirectUri,
                    code_verifier: codeVerifier,
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
                    },
                }
            );

            const accessToken = tokenResponse.data.access_token;
            const refreshToken = tokenResponse.data.refresh_token;

            await this.prisma.token.create({
                data: {
                    accessToken,
                    refreshToken,
                },
            });

            return { accessToken, refreshToken };
        } catch (error) {
            console.error('Error requesting access token:', error);
            throw error;
        }
    }
   async getMeetings(token: string) {
    try {
      const response = await axios.get('https://api.zoom.us/v2/users/me/meetings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error', error);
      throw error;
    }
  }

  async createMeeting(token: string, topic: string, start_time: string, type: number, duration: number, timezone: string, agenda: string) {
    try {
      const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', {
        topic,
        type,
        start_time,
        duration,
        timezone,
        agenda,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          watermark: false,
          use_pmi: false,
          approval_type: 0,
          audio: 'both',
          auto_recording: 'none'
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error', error);
      throw error;
    }
  }
}
