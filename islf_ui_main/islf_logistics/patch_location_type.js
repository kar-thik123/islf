const fs = require('fs');

let tsContent = fs.readFileSync('src/app/pages/Operation/job-card.ts', 'utf8');

const adapterTarget = `      from_location_type: booking.from_location_type,
      from_location: this.resolveLocationCodeFromName(booking.from_location),
      to_location_type: booking.to_location_type,
      to_location: this.resolveLocationCodeFromName(booking.to_location),`;

const adapterReplacement = `      from_location_type: booking.from_location_type || this.resolveLocationType(booking.from_location),
      from_location: this.resolveLocationCodeFromName(booking.from_location),
      to_location_type: booking.to_location_type || this.resolveLocationType(booking.to_location),
      to_location: this.resolveLocationCodeFromName(booking.to_location),`;

const methodTarget = `  resolveLocationCodeFromName(name: any): string {`;

const methodReplacement = `  resolveLocationType(locationCodeOrName: string): string {
    const code = this.resolveLocationCodeFromName(locationCodeOrName);
    const match = this.allLocations.find((l: any) => l.code === code);
    return match ? (match.type || '') : '';
  }

  resolveLocationCodeFromName(name: any): string {`;

tsContent = tsContent.replace(adapterTarget, adapterReplacement);
tsContent = tsContent.replace(methodTarget, methodReplacement);

fs.writeFileSync('src/app/pages/Operation/job-card.ts', tsContent, 'utf8');
console.log('Location Type Patch Complete.');
