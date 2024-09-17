import { IsObject, IsString } from "class-validator";

class WatsonAssistantDto {
    @IsObject()
    output: {
        intents?: [],
        entities?: [],
        generic?: []
    }

    @IsString()
    user_id: string

    @IsObject()
    context: {
        global?: {
            system?: {
                session_start_time ?: string,
                turn_count ?: number,
                user_id ?: string,
                state ?: string
            },
            session_id?: string
        },
        skills?: object
    }
}

class WatsonConfigDto{
    @IsString()
    user_id: string = ""

    @IsString()
    session_id: string = ""

    @IsObject()
    context: {} | any
}

export {
    WatsonAssistantDto,
    WatsonConfigDto
}