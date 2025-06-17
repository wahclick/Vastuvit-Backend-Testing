// dto/update-leave-setting.dto.ts
export class UpdateLeaveSettingDto {
  leaveType:
    | 'shl'
    | 'hl'
    | 'el'
    | 'cl'
    | 'lop'
    | 'lwp'
    | 'co'
    | 'sl'
    | 'mgl'
    | 'ml'
    | 'pl'
    | 'ph'
    | 'bl';
  enabled: boolean;
}
