/**
 * Email header data
 */
export class EmailHeader {
  // Email ID
  public emailId: number;
  // Email sender ("FROM" header)
  public from: string;
  // Email subject ("SUBJECT" header)
  public subject: string;
  // Email date ("DATE" header)
  public date: Date;

  constructor(data: {
    emailId: number;
    from: string;
    subject: string;
    date: Date;
  }) {
    this.emailId = data?.emailId ?? null;
    this.from = data.from ?? '';
    this.subject = data.subject ?? '';
    this.date = data.date ?? null;
  }

  /**
   * Create a new EmailHeader object from data returned from backend
   * @param {any} data - Data returned from backend
   */
  public static createFromAPI(data: any): EmailHeader {
    return new EmailHeader(data);
  }
}
