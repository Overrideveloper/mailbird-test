import { ParsedMail } from 'mailparser';

/**
 * Retrieved email header data
 */
export class EmailHeader {
  // Retrieved email id attribute
  public emailId: number;
  // Retrieved email "FROM" header
  public from: string;
  // Retrieved email "SUBJECT" header
  public subject: string;
  // Retrieved email "DATE" header
  public date: Date;

  constructor(data: { emailId: number; from: string; subject: string; date: Date }) {
    this.emailId = data?.emailId ?? null;
    this.from = data?.from ?? '';
    this.subject = data?.subject ?? '';
    this.date = data?.date ?? null;
  }

  /**
   * Create email header data from a given ParsedMail object and email id
   * @param {ParsedMail} - ParsedMail object
   */
  public static createFromParsedMailAndEmailId(parsedMail: ParsedMail, emailId: number): EmailHeader {
    return new EmailHeader({
      emailId,
      from: parsedMail?.from?.text,
      subject: parsedMail?.subject,
      date: parsedMail?.date,
    });
  }
}
