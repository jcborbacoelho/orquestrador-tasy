import { Body, Controller, Post } from '@nestjs/common';
import { TwilioRequestDTO } from './dto/twilio-request.dto';
import { TwilioService } from './twilio.service';

@Controller('twilio')
export class TwilioController {
    constructor(
        private readonly twilioService: TwilioService
    ){}

    @Post('message')
    async twilio(@Body() body: TwilioRequestDTO): Promise<any> {
        await this.twilioService.run(body)
        return {message: 'Success'}
    }
}
