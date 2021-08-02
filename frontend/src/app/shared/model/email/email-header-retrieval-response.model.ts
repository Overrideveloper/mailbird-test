import { EmailHeader } from './email-header.model';

/**
 * Response data for email header retrieval request.
 */
export class EmailHeaderRetrievalResponse {
  // List of retrieved email headers.
  public headerList: EmailHeader[];
  // Next retrieval request start range.
  public nextStartRange: number;

  constructor(data: { headerList: EmailHeader[]; nextStartRange: number }) {
    this.headerList = data?.headerList ?? [];
    this.nextStartRange = data?.nextStartRange ?? null;
  }

  /**
   * Create a new EmailHeaderRetrievalResponse object from data returned from the backend
   * @param {any} data - Data returned from the backend
   */
  public static createFromAPI(data: any): EmailHeaderRetrievalResponse {
    return new EmailHeaderRetrievalResponse({
      headerList: (data?.headerList ?? []).map((header: any) =>
        EmailHeader.createFromAPI(header)
      ),
      nextStartRange: data?.nextStartRange,
    });
  }
}
