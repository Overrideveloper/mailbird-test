import { ParsedMail } from 'mailparser';

/**
 * Retrieved email body data
 */
export class EmailBody {
  // Email text body
  public text: string;
  // Email html body
  public html?: string;

  constructor(data: { text: string; html?: string }) {
    this.text = data?.text ?? '';
    this.html = data?.html ?? '';
  }

  /**
   * Create email body data from a ParsedMail object
   * @param {ParsedMail} - ParsedMail object
   */
  public static createFromParsedMail(parsedMail: ParsedMail): EmailBody {
    return new EmailBody({
      text: parsedMail?.text,
      html: parsedMail?.html ? parsedMail?.html : parsedMail?.textAsHtml,
    });
  }
}
