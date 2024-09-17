export const Constant ={
    /** 
     * Defining the type of message sent by the Broker 
     * */
    BROKER_TYPE_TEXT: "TEXT",
    BROKER_TYPE_DOCUMENT: "DOCUMENT",
    BROKER_TYPE_AUDIO: "AUDIO",

    /**
     * TWILIO
     */
    TWILIO_TYPE_TEXT: 0,
    TWILIO_TYPE_FILE: 1,
    TWILIO_TYPE_FILE_AUDIO: 'audio',
    CHANNEL_TWILIO: "Channel::Twilio::Whatsapp", 

    /**
     * CHANNEL
     */
    CHANNEL_WIDGET: "Channel::WebWidget",
    CHANNEL_WHATSAPP: "whatsapp",

    /**
     * WATSON ASSISTANT 
     */
    WATSON_EXPIRED_SESSION: 404,
    WATSON_VERSION: '2024-09-17',

    /**
     * Used to inform clients about some exception
     */
    EXCEPTION_FOR_HUMANS: "Houve um erro, por favor tente mais tarde",

    /**
     * TYPE MEDIA TO META
     */
    MEDIA_TYPE_TEXT: 'TEXT',
    MEDIA_TYPE_IMAGE: 'IMAGE',
    MEDIA_TYPE_LOCATION: 'LOCATION',
    MEDIA_TYPE_DOCUMENT: 'DOCUMENT',
    MEDIA_TYPE_INTERACTIVE: 'INTERACTIVE',
    META_PHONE_NUMBER_ID: '105280319003599',
}

