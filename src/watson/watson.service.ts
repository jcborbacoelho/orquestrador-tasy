import { Injectable } from '@nestjs/common';
import * as AssistantV2 from 'ibm-watson/assistant/v2'
import { IamAuthenticator }  from 'ibm-watson/auth'
import { Constant } from 'src/helpers/constant';
import { WatsonConfigDto } from './dto/watsonAssistant.dto';

@Injectable()
export class WatsonService {
    private assistantV2

    constructor() {}

    async createInstance() {
        this.assistantV2 = await new AssistantV2({
            version: Constant.WATSON_VERSION,
            authenticator: new IamAuthenticator({
                apikey: process.env.WATSON_API_KEY
            }),
            serviceUrl: process.env.WATSON_URL
        })
    }

    async createSession(): Promise<string> {
        return await this.assistantV2.createSession({
            assistantId: process.env.WATSON_ENVIRONMENT_ID
        }).then(res => {
            return res.result.session_id
        }).catch(err => {
            console.log(err)
        })
    }

    async message(brokerInput: string, watsonConfig: WatsonConfigDto): Promise<any> {
        try {
            const payload = {
                assistantId: process.env.WATSON_ENVIRONMENT_ID,
                sessionId: watsonConfig.session_id,
                input: {
                    message_type: 'text',
                    text: brokerInput,
                    options: { return_context: true },
                },
                context: watsonConfig?.context ?? {}
            }

            if(watsonConfig.context?.global?.system?.user_id) {
                payload['userId'] = watsonConfig.context.global.system.user_id
            }

            const watsonResponse = await this.assistantV2.message(payload)  
            
            return watsonResponse.result
        } catch (error) {
            return error
        }
    }
}
