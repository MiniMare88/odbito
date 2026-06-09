export { sequelize } from './db.js'
import { sequelize } from './db.js'

// Import models
import User from './User.js'
import EmailVerificationToken from './EmailVerificationToken.js'
import PasswordResetToken from './PasswordResetToken.js'
import WaiverVersion from './WaiverVersion.js'
import ClassType from './ClassType.js'
import ClassSchedule from './ClassSchedule.js'
import ClassSession from './ClassSession.js'
import SeasonalPlan from './SeasonalPlan.js'
import SeasonalPlanPrice from './SeasonalPlanPrice.js'
import DiscountCode from './DiscountCode.js'
import DiscountCodeUse from './DiscountCodeUse.js'
import OpenJumpBooking from './OpenJumpBooking.js'
import Subscription from './Subscription.js'
import ClassAttendance from './ClassAttendance.js'
import ParkClosure from './ParkClosure.js'
import ApplicationStatus from './ApplicationStatus.js'
import Application from './Application.js'
import StaffMember from './StaffMember.js'
import StaffAvailability from './StaffAvailability.js'
import WorkBlockProposal from './WorkBlockProposal.js'
import StaffNotification from './StaffNotification.js'
import BirthdayBooking from './BirthdayBooking.js'
import ParkSchedule from './ParkSchedule.js'
import ParkScheduleOverride from './ParkScheduleOverride.js'
import UserNote from './UserNote.js'
import Voucher from './Voucher.js'
import CustomerBalance from './CustomerBalance.js'
import VoucherRedemption from './VoucherRedemption.js'
import AkademijaGroup from './AkademijaGroup.js'

// ── Associations ─────────────────────────────────────────────

// User → EmailVerificationToken
User.hasMany(EmailVerificationToken, { foreignKey: 'user_id', as: 'verificationTokens' })
EmailVerificationToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

// User → PasswordResetToken
User.hasMany(PasswordResetToken, { foreignKey: 'user_id', as: 'resetTokens' })
PasswordResetToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

// User → OpenJumpBooking
User.hasMany(OpenJumpBooking, { foreignKey: 'user_id', as: 'bookings' })
OpenJumpBooking.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
OpenJumpBooking.belongsTo(User, { foreignKey: 'cancelled_by', as: 'cancelledBy' })

// User → Subscription
User.hasMany(Subscription, { foreignKey: 'user_id', as: 'subscriptions' })
Subscription.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

// ClassType → ClassSchedule
ClassType.hasMany(ClassSchedule, { foreignKey: 'class_type_id', as: 'schedules' })
ClassSchedule.belongsTo(ClassType, { foreignKey: 'class_type_id', as: 'classType' })

// ClassSchedule → ClassSession
ClassSchedule.hasMany(ClassSession, { foreignKey: 'class_schedule_id', as: 'sessions' })
ClassSession.belongsTo(ClassSchedule, { foreignKey: 'class_schedule_id', as: 'schedule' })

// ClassType → ClassSession
ClassType.hasMany(ClassSession, { foreignKey: 'class_type_id', as: 'sessions' })
ClassSession.belongsTo(ClassType, { foreignKey: 'class_type_id', as: 'classType' })

// ClassType → Subscription
ClassType.hasMany(Subscription, { foreignKey: 'class_type_id', as: 'subscriptions' })
Subscription.belongsTo(ClassType, { foreignKey: 'class_type_id', as: 'classType' })

// SeasonalPlan → Subscription
SeasonalPlan.hasMany(Subscription, { foreignKey: 'seasonal_plan_id', as: 'subscriptions' })
Subscription.belongsTo(SeasonalPlan, { foreignKey: 'seasonal_plan_id', as: 'seasonalPlan' })

// SeasonalPlan → SeasonalPlanPrice
SeasonalPlan.hasMany(SeasonalPlanPrice, { foreignKey: 'seasonal_plan_id', as: 'prices' })
SeasonalPlanPrice.belongsTo(SeasonalPlan, { foreignKey: 'seasonal_plan_id', as: 'plan' })

// ClassType → SeasonalPlanPrice
ClassType.hasMany(SeasonalPlanPrice, { foreignKey: 'class_type_id', as: 'seasonalPrices' })
SeasonalPlanPrice.belongsTo(ClassType, { foreignKey: 'class_type_id', as: 'classType' })

// DiscountCode
User.hasMany(DiscountCode, { foreignKey: 'created_by', as: 'createdDiscountCodes' })
DiscountCode.belongsTo(User, { foreignKey: 'created_by', as: 'creator' })

DiscountCode.hasMany(OpenJumpBooking, { foreignKey: 'discount_code_id', as: 'bookings' })
OpenJumpBooking.belongsTo(DiscountCode, { foreignKey: 'discount_code_id', as: 'discountCode' })

DiscountCode.hasMany(Subscription, { foreignKey: 'discount_code_id', as: 'subscriptions' })
Subscription.belongsTo(DiscountCode, { foreignKey: 'discount_code_id', as: 'discountCode' })

DiscountCode.hasMany(DiscountCodeUse, { foreignKey: 'discount_code_id', as: 'uses' })
DiscountCodeUse.belongsTo(DiscountCode, { foreignKey: 'discount_code_id', as: 'code' })
User.hasMany(DiscountCodeUse, { foreignKey: 'user_id', as: 'discountUses' })
DiscountCodeUse.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

// ClassAttendance
Subscription.hasMany(ClassAttendance, { foreignKey: 'subscription_id', as: 'attendance' })
ClassAttendance.belongsTo(Subscription, { foreignKey: 'subscription_id', as: 'subscription' })

ClassSession.hasMany(ClassAttendance, { foreignKey: 'class_session_id', as: 'attendance' })
ClassAttendance.belongsTo(ClassSession, { foreignKey: 'class_session_id', as: 'session' })

User.hasMany(ClassAttendance, { foreignKey: 'user_id', as: 'attendance' })
ClassAttendance.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

// ParkClosure
User.hasMany(ParkClosure, { foreignKey: 'created_by', as: 'parkClosures' })
ParkClosure.belongsTo(User, { foreignKey: 'created_by', as: 'creator' })

// UserNote
User.hasMany(UserNote, { foreignKey: 'user_id', as: 'notes' })
UserNote.belongsTo(User, { foreignKey: 'user_id', as: 'targetUser' })
UserNote.belongsTo(User, { foreignKey: 'created_by', as: 'author' })

// Voucher
Voucher.belongsTo(User, { foreignKey: 'redeemed_by', as: 'redeemedByUser' })
Voucher.belongsTo(User, { foreignKey: 'created_by', as: 'createdByUser' })
User.hasMany(Voucher, { foreignKey: 'redeemed_by', as: 'redeemedVouchers' })
User.hasMany(Voucher, { foreignKey: 'created_by', as: 'purchasedVouchers' })

// CustomerBalance
User.hasOne(CustomerBalance, { foreignKey: 'user_id', as: 'balance' })
CustomerBalance.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

// VoucherRedemption
VoucherRedemption.belongsTo(Voucher, { foreignKey: 'voucher_id', as: 'voucher' })
VoucherRedemption.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
Voucher.hasMany(VoucherRedemption, { foreignKey: 'voucher_id', as: 'redemptions' })
User.hasMany(VoucherRedemption, { foreignKey: 'user_id', as: 'voucherRedemptions' })

// BirthdayBooking
User.hasMany(BirthdayBooking, { foreignKey: 'user_id', as: 'birthdayBookings' })
BirthdayBooking.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
BirthdayBooking.belongsTo(User, { foreignKey: 'cancelled_by', as: 'cancelledBy' })

// Applications
ApplicationStatus.hasMany(Application, { foreignKey: 'status_id', as: 'applications' })
Application.belongsTo(ApplicationStatus, { foreignKey: 'status_id', as: 'status' })

// StaffMember ↔ User
User.hasOne(StaffMember, { foreignKey: 'user_id', as: 'staffProfile' })
StaffMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

// StaffAvailability
StaffMember.hasMany(StaffAvailability, { foreignKey: 'staff_member_id', as: 'availability' })
StaffAvailability.belongsTo(StaffMember, { foreignKey: 'staff_member_id', as: 'staffMember' })

// WorkBlockProposal
StaffMember.hasMany(WorkBlockProposal, { foreignKey: 'staff_member_id', as: 'proposals' })
WorkBlockProposal.belongsTo(StaffMember, { foreignKey: 'staff_member_id', as: 'staffMember' })
User.hasMany(WorkBlockProposal, { foreignKey: 'proposed_by', as: 'proposedBlocks' })
WorkBlockProposal.belongsTo(User, { foreignKey: 'proposed_by', as: 'proposedByUser' })

// StaffNotification
StaffMember.hasMany(StaffNotification, { foreignKey: 'staff_member_id', as: 'notifications' })
StaffNotification.belongsTo(StaffMember, { foreignKey: 'staff_member_id', as: 'staffMember' })
WorkBlockProposal.hasMany(StaffNotification, { foreignKey: 'block_proposal_id', as: 'notifications' })
StaffNotification.belongsTo(WorkBlockProposal, { foreignKey: 'block_proposal_id', as: 'proposal' })

export {
  User,
  EmailVerificationToken,
  PasswordResetToken,
  WaiverVersion,
  ClassType,
  ClassSchedule,
  ClassSession,
  SeasonalPlan,
  SeasonalPlanPrice,
  DiscountCode,
  DiscountCodeUse,
  OpenJumpBooking,
  Subscription,
  ClassAttendance,
  ParkClosure,
  ApplicationStatus,
  Application,
  StaffMember,
  StaffAvailability,
  WorkBlockProposal,
  StaffNotification,
  BirthdayBooking,
  ParkSchedule,
  ParkScheduleOverride,
  UserNote,
  Voucher,
  CustomerBalance,
  VoucherRedemption,
  AkademijaGroup,
}

export default sequelize
