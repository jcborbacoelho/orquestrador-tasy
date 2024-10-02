import { IsNumber, IsObject, IsArray, IsString } from 'class-validator';

class Intent {
  @IsString()
  intent: string;

  @IsNumber()
  confidence: number;

  constructor(intent: string, confidence: number) {
    this.intent = intent;
    this.confidence = confidence;
  }
}

class Input {
  @IsString()
  suggestion_id: string;

  @IsString()
  text: string;

  @IsArray()
  intents: Intent[];

  @IsArray()
  entities: any[];

  constructor(
    suggestion_id: string,
    text: string,
    intents: Intent[],
    entities: any[],
  ) {
    this.suggestion_id = suggestion_id;
    this.text = text;
    this.intents = intents;
    this.entities = entities;
  }
}

class Value {
  @IsObject()
  input: Input;

  @IsObject()
  output: any;

  @IsString()
  dialog_node: string;

  constructor(input: Input, output: any, dialog_node: string) {
    this.input = input;
    this.output = output;
    this.dialog_node = dialog_node;
  }
}

class Suggestion {
  @IsString()
  label: string;

  @IsObject()
  value: Value;

  constructor(label: string, value: Value) {
    this.label = label;
    this.value = value;
  }
}

class WatsonAssistantOutputGenericDTO {
  @IsString()
  response_type: string;
  @IsString()
  text?: string;

  @IsString()
  title: string;

  @IsArray()
  suggestions: Suggestion[];

  constructor(response_type: string, title: string, suggestions: Suggestion[]) {
    this.response_type = response_type;
    this.title = title;
    this.suggestions = suggestions;
  }
}

class WatsonAssistantDto {
  @IsObject()
  output: {
    intents?: [];
    entities?: [];
    generic?: WatsonAssistantOutputGenericDTO[];
  };

  @IsString()
  user_id: string;

  @IsObject()
  context: {
    global?: {
      system?: {
        session_start_time?: string;
        turn_count?: number;
        user_id?: string;
        state?: string;
      };
      session_id?: string;
    };
    skills?: object;
  };
}

class WatsonConfigDto {
  @IsString()
  user_id = '';

  @IsString()
  session_id = '';

  @IsObject()
  context: {} | any;
}

export { WatsonAssistantDto, WatsonConfigDto };
