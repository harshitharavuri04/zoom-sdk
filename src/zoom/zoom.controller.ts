// zoom.controller.ts

import { Controller, Get, Redirect, Query, Post, Body } from '@nestjs/common';
import { ZoomService } from './zoom.service';

@Controller('zoom')
export class ZoomController {
  constructor(private readonly zoomService: ZoomService) {}

  @Get('authorize')
  @Redirect()
  async authorize() {
    const authorizationUrl = await this.zoomService.getAuthorizationUrl();
    return { url: authorizationUrl };
  }

  @Get('callback')
    @Redirect('success') // Redirect to success page
    async callback(@Query('code') code: string, @Query('code_verifier') codeVerifier: string) {
        const tokens = await this.zoomService.requestAccessToken(code, codeVerifier);
        console.log(tokens); // Log tokens to console
    }


  @Get('success')
  successPage() {
    return 'Authorization successful!'; // You can return an actual HTML page here
  }
@Get('meetings')
  async getMeetings(@Body('token') token: string) {
    return this.zoomService.getMeetings(token);
  }

  @Post('meetings')
  async createMeeting(
    @Body('token') token: string,
    @Body('topic') topic: string,
    @Body('start_time') start_time: string,
    @Body('type') type: number,
    @Body('duration') duration: number,
    @Body('timezone') timezone: string,
    @Body('agenda') agenda: string,
  ) {
    return this.zoomService.createMeeting(token, topic, start_time, type, duration, timezone, agenda);
  }
}
