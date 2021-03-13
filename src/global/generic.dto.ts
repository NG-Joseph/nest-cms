export class GenericBulmaNotificationResponseDto{
    readonly notificationClass: "is-success" | "is-failure" | "is-info" | "is-warning";
    readonly notificationMessage: string;
    readonly notificationMessageDetail?: string;
}

