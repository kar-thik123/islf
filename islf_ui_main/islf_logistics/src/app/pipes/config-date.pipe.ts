import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from '../services/config.service';

@Pipe({
  name: 'configDate',
  standalone: true
})
export class ConfigDatePipe implements PipeTransform {
  constructor(private configService: ConfigService) {}

  transform(value: Date | string | null | undefined, format?: string): string {
    if (!value) {
      return '';
    }

    return this.configService.formatDate(value, format);
  }
} 