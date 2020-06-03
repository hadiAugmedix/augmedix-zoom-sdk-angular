export interface ZoomInterface {
  meetingID: string;
  pw: string;
  host: ZoomHostInterface;
}

export interface ZoomHostInterface {
  name: string;
  email: string;
}
