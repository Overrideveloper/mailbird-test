import { Pipe, PipeTransform } from '@angular/core';
import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
  SafeScript,
  SafeStyle,
  SafeUrl,
} from '@angular/platform-browser';

/**
 * Pipe to mark different types of trusted content as safe
 */
@Pipe({
  name: 'safe',
})
export class SafePipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  public transform(
    content: string,
    type: string
  ): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
    switch (type) {
      case 'html':
        return this.sanitizer.bypassSecurityTrustHtml(content);
      case 'style':
        return this.sanitizer.bypassSecurityTrustStyle(content);
      case 'script':
        return this.sanitizer.bypassSecurityTrustScript(content);
      case 'url':
        return this.sanitizer.bypassSecurityTrustUrl(content);
      case 'resourceUrl':
        return this.sanitizer.bypassSecurityTrustResourceUrl(content);
      default:
        throw new Error(`Unable to bypass security for invalid type: ${type}`);
    }
  }
}
