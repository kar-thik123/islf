import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MasterCodeComponent } from '../pages/masters/mastercode';
import { MasterCodeService } from '../services/mastercode.service';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { provideZoneChangeDetection } from '@angular/core';


describe('MasterCodeComponent', () => {
  let component: MasterCodeComponent;
  let fixture: ComponentFixture<MasterCodeComponent>;
  let mockService: jasmine.SpyObj<MasterCodeService>;

  const mockMasters = [
    { code: 'A1', description: 'Test A1', reference: 'User / Role', status: 'Active' },
    { code: 'B1', description: 'Test B1', reference: 'User / Designation', status: 'Inactive' }
  ];

  beforeEach(async () => {
    mockService = jasmine.createSpyObj<MasterCodeService>('MasterCodeService', [
      'getMasters', 'createMaster', 'updateMaster', 'deleteMaster'
    ]);

    await TestBed.configureTestingModule({
      imports: [MasterCodeComponent, ToastModule],
      providers: [
        { provide: MasterCodeService, useValue: mockService },
        MessageService,
        { provide: Router, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MasterCodeComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load masters on init', fakeAsync(() => {
    mockService.getMasters.and.returnValue(of(mockMasters));
    fixture.detectChanges();
    tick();
    expect(component.masters.length).toBe(2);
    expect(component.activeCodes.length).toBe(1);
  }));

  it('should add a new row', () => {
    component.addRow();
    expect(component.masters[0].isNew).toBeTrue();
    expect(component.masters[0].isEditing).toBeTrue();
  });

  it('should save a new master', fakeAsync(() => {
    const newMaster = {
      code: 'C1', description: 'New Entry', reference: 'User / Role', status: 'Active',
      isNew: true, isEditing: true
    };

    component.masters = [newMaster];
    mockService.createMaster.and.returnValue(of({ ...newMaster, isNew: false, isEditing: false }));
    component.saveRow(newMaster);
    tick();

    expect(mockService.createMaster).toHaveBeenCalledWith({
      code: 'C1',
      description: 'New Entry',
      reference: 'User / Role',
      status: 'Active'
    });
    expect(newMaster.isNew).toBeFalse();
  }));

  it('should warn if active code for same reference already exists', () => {
    component.masters = [
      {id: 1, code: 'X', reference: 'User / Status', status: 'Active', isNew: false },
      {
        id: 2, code: 'Y', reference: 'User / Status', status: 'Active',
        isNew: true, isEditing: true
      }
    ];

    const addSpy = spyOn(component['messageService'], 'add');
    component.saveRow(component.masters[1]);

    expect(addSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'warn',
      summary: 'Not Allowed'
    }));
  });

  it('should update an existing master', fakeAsync(() => {
    const existing = {
      id: 1,  description: 'Updated Desc', reference: 'User / Role', status: 'Inactive',
      isEditing: true, isNew: false
    };
    mockService.updateMaster.and.returnValue(of(existing));
    component.saveRow(existing);
    tick();
    expect(mockService.updateMaster).toHaveBeenCalledWith('A1', {
      description: 'Updated Desc',
      reference: 'User / Role',
      status: 'Inactive'
    });
    expect(existing.isEditing).toBeFalse();
  }));




});
