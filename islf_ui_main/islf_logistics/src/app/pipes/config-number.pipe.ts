import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from '../services/config.service';

@Pipe({
  name: 'configNumber',
  standalone: true
})
export class ConfigNumberPipe implements PipeTransform {
  constructor(private configService: ConfigService) {}

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    return this.configService.formatNumber(value);
  }
} 