import MemberRoles from '@/contracts/MemberRoles.json'
import BaseContract from './BaseContract'

const MemberRoles_KEY = "MemberRoles";

class MemberRolesContract extends BaseContract {
  constructor(vue) {
    super(MemberRoles_KEY, MemberRoles, vue);
  }
}
MemberRolesContract.key = MemberRoles_KEY;
export default MemberRolesContract