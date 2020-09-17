type EmptyMessage = {
    event: "empty"
}

type DeleteTokensMessage = {
    event: "deleteTokens",
    user: string,
    scene: string,
    tokens: string[]   
}

type StrikeMessage = EmptyMessage | DeleteTokensMessage;

type MessageHandler = (message: StrikeMessage) => void;