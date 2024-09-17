import { ApiProperty } from "@nestjs/swagger";

export class TwilioRequestDTO {
    @ApiProperty()
    NumMedia: string;

    @ApiProperty()
    ProfileName: string;

    @ApiProperty()
    WaId: string;

    @ApiProperty()
    Body: string;

    @ApiProperty({description: "numero da twilio"})
    To: string;

    @ApiProperty({description: "numero do usuario"})
    From: string

    @ApiProperty()
    MediaUrl: string;

    @ApiProperty()
    AccountSid: string

}