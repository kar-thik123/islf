import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from '../services/config.service';

@Pipe({
  name: 'configCurrency',
  standalone: true
})
export class ConfigCurrencyPipe implements PipeTransform {
  constructor(private configService: ConfigService) {}

  transform(value: number | null | undefined, currency?: string): string {
    if (value === null || value === undefined) {
      return '';
    }

    return this.configService.formatCurrency(value, currency);
  }
} 