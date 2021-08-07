import { ParsedMail } from 'mailparser';

/**
 * Retrieved email header data
 */
export class EmailHeader {
  // Retrieved email id attribute
  public emailId: number | string;
  // "Name" value of retrieved email "FROM" header
  public fromName: string;
  // "Address" value of retrieved email "FROM" header
  public fromAddress: string;
  // Retrieved email "SUBJECT" header
  public subject: string;
  // Retrieved email "DATE" header
  public date: Date;

  constructor(data: { emailId: number | string; fromName: string; fromAddress: string; subject: string; date: Date }) {
    this.emailId = data?.emailId ?? null;
    this.fromName = data?.fromName ?? '';
    this.fromAddress = data?.fromAddress ?? '';
    this.subject = data?.subject ?? '';
    this.date = data?.date ?? null;
  }

  /**
   * Create email header data from a given ParsedMail object and email id
   * @param {ParsedMail} - ParsedMail object
   */
  public static createFromParsedMailAndEmailId(parsedMail: ParsedMail, emailId: number | string): EmailHeader {
    return new EmailHeader({
      emailId,
      fromName: parsedMail?.from?.value[0]?.name,
      fromAddress: parsedMail?.from?.value[0]?.address,
      subject: parsedMail?.subject,
      date: parsedMail?.date,
    });
  }
}
