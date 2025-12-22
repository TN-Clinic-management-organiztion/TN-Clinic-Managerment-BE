import { PatientProfile } from './../../../database/entities/auth/patient_profiles.entity';
import { SysUser } from 'src/database/entities/auth/sys_users.entity';
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { CreatePatientDto, Gender } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientSearchDto } from './dto/patient-search.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(SysUser)
    private usersRepository: Repository<SysUser>,
    @InjectRepository(PatientProfile)
    private patientRepository: Repository<PatientProfile>,
  ) {}

  async create(createPatientDto: CreatePatientDto, createdByStaffId?: string) {
    // 1. Kiểm tra số điện thoại đã tồn tại chưa (quan trọng vì là identifier chính)
    if (createPatientDto.phone) {
      const existingPhone = await this.usersRepository.findOne({
        where: { phone: createPatientDto.phone },
      });
      if (existingPhone) {
        throw new ConflictException(
          'Số điện thoại đã được đăng ký cho bệnh nhân khác',
        );
      }
    }

    // 2. Kiểm tra CCCD nếu có
    if (createPatientDto.cccd) {
      const existingCCCD = await this.usersRepository.findOne({
        where: { cccd: createPatientDto.cccd },
      });
      if (existingCCCD) {
        throw new ConflictException('CCCD đã tồn tại trong hệ thống');
      }
    }

    // 3. Tạo user (KHÔNG có username/password, chỉ có phone và optional CCCD)
    const user = this.usersRepository.create({
      phone: createPatientDto.phone,
      cccd: createPatientDto.cccd || undefined,
    });

    const savedUser = await this.usersRepository.save(user);

    // 4. Tạo patient profile
    const patientProfile = this.patientRepository.create({
      patient_id: savedUser.user_id,
      full_name: createPatientDto.full_name,
      dob: new Date(createPatientDto.dob),
      gender: createPatientDto.gender,
      address: createPatientDto.address,
      medical_history: createPatientDto.medical_history,
      allergy_history: createPatientDto.allergy_history,
    });

    await this.patientRepository.save(patientProfile);

    return {
      success: true,
      patient_id: savedUser.user_id,
      full_name: createPatientDto.full_name,
      phone: savedUser.phone,
      cccd: savedUser.cccd,
      has_cccd: !!savedUser.cccd,
      message: savedUser.cccd
        ? 'Tạo hồ sơ bệnh nhân với CCCD thành công'
        : 'Tạo hồ sơ bệnh nhân không có CCCD thành công',
      created_by: createdByStaffId,
      created_at: new Date(),
    };
  }

  async updateCCCD(patientId: string, newCCCD: any) {
    const patient = await this.patientRepository.findOne({
      where: { patient_id: patientId },
      relations: ['user'],
    });
    if (!patient) throw new NotFoundException('Không tìm thấy bệnh nhân');

    const normalized = (newCCCD ?? '').toString().trim();
    const valueToSave: string | null =
      normalized.length === 0 ? null : normalized;

    // nếu set CCCD mới thì check trùng
    if (valueToSave) {
      const existing = await this.usersRepository.findOne({
        where: { cccd: valueToSave },
      });
      if (existing && existing.user_id !== patientId) {
        throw new ConflictException('CCCD đã thuộc về bệnh nhân khác');
      }
    }

    // ✅ save thay vì update
    const user = await this.usersRepository.findOne({
      where: { user_id: patientId },
    });
    if (!user) throw new NotFoundException('Không tìm thấy user của bệnh nhân');

    user.cccd = valueToSave; // null hoặc string
    await this.usersRepository.save(user);

    return {
      success: true,
      patient_id: patientId,
      full_name: patient.full_name,
      old_cccd: patient.user?.cccd,
      new_cccd: valueToSave,
      updated_at: new Date(),
      message: valueToSave
        ? 'Cập nhật CCCD thành công'
        : 'Đã xóa CCCD khỏi hồ sơ bệnh nhân',
    };
  }

  async update(patientId: string, updatePatientDto: UpdatePatientDto) {
    // 1. Tìm patient
    const patient = await this.patientRepository.findOne({
      where: { patient_id: patientId },
      relations: ['user'],
    });

    if (!patient) {
      throw new NotFoundException('Không tìm thấy bệnh nhân');
    }

    // 2. Kiểm tra phone mới nếu có thay đổi
    if (
      updatePatientDto.phone &&
      updatePatientDto.phone !== patient.user?.phone
    ) {
      const existingPhone = await this.usersRepository.findOne({
        where: { phone: updatePatientDto.phone },
      });
      if (existingPhone) {
        throw new ConflictException('Số điện thoại đã được sử dụng');
      }
    }

    // 3. Kiểm tra CCCD mới nếu có thay đổi
    if (updatePatientDto.cccd && updatePatientDto.cccd !== patient.user?.cccd) {
      const existingCCCD = await this.usersRepository.findOne({
        where: { cccd: updatePatientDto.cccd },
      });
      if (existingCCCD) {
        throw new ConflictException('CCCD đã tồn tại trong hệ thống');
      }
    }

    // 4. Cập nhật thông tin user
    const userUpdates: any = {};
    if (updatePatientDto.phone !== undefined)
      userUpdates.phone = updatePatientDto.phone;
    if (updatePatientDto.cccd !== undefined)
      userUpdates.cccd = updatePatientDto.cccd;

    if (Object.keys(userUpdates).length > 0) {
      await this.usersRepository.update(patientId, userUpdates);
    }

    // 5. Cập nhật thông tin patient profile
    const patientUpdates: any = {};
    if (updatePatientDto.full_name !== undefined)
      patientUpdates.full_name = updatePatientDto.full_name;
    if (updatePatientDto.dob !== undefined)
      patientUpdates.dob = new Date(updatePatientDto.dob);
    if (updatePatientDto.gender !== undefined)
      patientUpdates.gender = updatePatientDto.gender;
    if (updatePatientDto.address !== undefined)
      patientUpdates.address = updatePatientDto.address;
    if (updatePatientDto.medical_history !== undefined)
      patientUpdates.medical_history = updatePatientDto.medical_history;
    if (updatePatientDto.allergy_history !== undefined)
      patientUpdates.allergy_history = updatePatientDto.allergy_history;

    if (Object.keys(patientUpdates).length > 0) {
      await this.patientRepository.update(patientId, patientUpdates);
    }

    // 6. Lấy thông tin mới nhất
    const updatedPatient = await this.patientRepository.findOne({
      where: { patient_id: patientId },
      relations: ['user'],
    });

    if (!updatedPatient) {
      throw new NotFoundException('Patient not found');
    }

    return {
      success: true,
      patient_id: updatedPatient.patient_id,
      full_name: updatedPatient.full_name,
      phone: updatedPatient.user?.phone,
      cccd: updatedPatient.user?.cccd,
      dob: updatedPatient.dob,
      gender: updatedPatient.gender,
      updated_at: new Date(),
    };
  }

  async search(searchDto: PatientSearchDto) {
    // Xây dựng query tìm kiếm linh hoạt
    const query = this.patientRepository
      .createQueryBuilder('patient')
      .innerJoinAndSelect('patient.user', 'user')
      .select([
        'patient.patient_id',
        'patient.full_name',
        'patient.dob',
        'patient.gender',
        'patient.medical_history',
        'patient.allergy_history',
        'user.phone',
        'user.cccd',
        'user.created_at',
      ]);

    if (searchDto.phone) {
      query.andWhere('user.phone LIKE :phone', {
        phone: `%${searchDto.phone}%`,
      });
    }

    if (searchDto.full_name) {
      query.andWhere('patient.full_name ILIKE :full_name', {
        full_name: `%${searchDto.full_name}%`,
      });
    }

    if (searchDto.cccd) {
      query.andWhere('user.cccd LIKE :cccd', { cccd: `%${searchDto.cccd}%` });
    }

    // Sắp xếp theo ngày tạo mới nhất
    query.orderBy('user.created_at', 'DESC');

    const patients = await query.getMany();

    return patients.map((patient) => ({
      patient_id: patient.patient_id,
      full_name: patient.full_name,
      dob: patient.dob,
      gender: patient.gender,
      phone: patient.user?.phone,
      cccd: patient.user?.cccd,
      has_cccd: !!patient.user?.cccd,
      medical_history: patient.medical_history,
      allergy_history: patient.allergy_history,
      created_at: patient.user?.created_at,
    }));
  }

  async findOne(patientId: string) {
    const patient = await this.patientRepository.findOne({
      where: { patient_id: patientId },
      relations: ['user'],
    });

    if (!patient) {
      throw new NotFoundException('Không tìm thấy bệnh nhân');
    }

    return {
      patient_id: patient.patient_id,
      full_name: patient.full_name,
      dob: patient.dob,
      gender: patient.gender,
      phone: patient.user?.phone,
      cccd: patient.user?.cccd,
      address: patient.address,
      medical_history: patient.medical_history,
      allergy_history: patient.allergy_history,
      created_at: patient.user?.created_at,
    };
  }

  async getByPhone(phone: string) {
    const user = await this.usersRepository.findOne({
      where: { phone },
      relations: ['patientProfile'],
    });

    if (!user || !user.patientProfile) {
      throw new NotFoundException(
        'Không tìm thấy bệnh nhân với số điện thoại này',
      );
    }

    return user.patientProfile;
  }

  async linkToAccount(patientId: string, username: string, password: string) {
    // Logic liên kết patient với tài khoản (khi patient đăng ký trên web)
    // ... (đã triển khai trong phiên bản trước)
  }
}
