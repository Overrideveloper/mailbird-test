/**
 * Email body data
 */
export class EmailBody {
  // Email text body
  public text: string;
  // Email html body
  public html?: string;

  constructor(data: { text: string; html?: string }) {
    this.text = data?.text ?? '';

    if (data.html) {
      this.html = data.html;
    }
  }

  /**
   * Create a new EmailBody object from data returned from backend
   * @param {any} data - Data returned from backend
   */
  public static createFromAPI(data: any) {
    return new EmailBody(data);
  }
}
