import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../modules/auth/entities/user.entity';
import { Acupoint } from '../modules/treatments/entities/acupoint.entity';
import { Herb } from '../modules/herbs/entities/herb.entity';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Acupoint)
    private readonly acupointRepository: Repository<Acupoint>,
    @InjectRepository(Herb)
    private readonly herbRepository: Repository<Herb>,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
    await this.seedAcupoints();
    await this.seedHerbs();
  }

  private async seedAdminUser() {
    const adminExists = await this.userRepository.findOne({
      where: { email: 'admin@clinic.com' },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.userRepository.save({
        email: 'admin@clinic.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'System',
        role: UserRole.ADMIN,
        isActive: true,
      });
      console.log('✅ Admin user created: admin@clinic.com / admin123');
    }
  }

  private async seedAcupoints() {
    const count = await this.acupointRepository.count();
    if (count > 0) return;

    const acupoints = [
      // Head & Face
      { code: 'GV20', nameEn: 'Baihui', nameTh: 'ไป่ฮุ่ย', nameCn: '百会', meridian: 'Governor Vessel', bodyRegion: 'head', locationDescription: 'กลางกระหม่อม', indications: ['ปวดศีรษะ', 'วิงเวียน', 'โรคหลอดเลือดสมอง'] },
      { code: 'GV26', nameEn: 'Renzhong', nameTh: 'เหรินจง', nameCn: '人中', meridian: 'Governor Vessel', bodyRegion: 'face', locationDescription: 'รอยบุ๋มใต้จมูก', indications: ['หมดสติ', 'ช็อค', 'โรคลมชัก'] },
      { code: 'ST36', nameEn: 'Zusanli', nameTh: 'จู๋ซานหลี่', nameCn: '足三里', meridian: 'Stomach', bodyRegion: 'leg', locationDescription: 'ใต้เข่า 3 ชุ่น', indications: ['บำรุงร่างกาย', 'ปัญหาระบบย่อยอาหาร', 'อ่อนเพลีย'] },
      { code: 'LI4', nameEn: 'Hegu', nameTh: 'เหอกู่', nameCn: '合谷', meridian: 'Large Intestine', bodyRegion: 'hand', locationDescription: 'ระหว่างนิ้วโป้งและนิ้วชี้', indications: ['ปวดศีรษะ', 'ปวดฟัน', 'หวัด', 'ปวดใบหน้า'] },
      { code: 'LI11', nameEn: 'Quchi', nameTh: 'ชวี่ฉื่อ', nameCn: '曲池', meridian: 'Large Intestine', bodyRegion: 'arm', locationDescription: 'ปลายรอยพับข้อศอก', indications: ['ไข้', 'ความดันสูง', 'โรคผิวหนัง'] },
      { code: 'SP6', nameEn: 'Sanyinjiao', nameTh: 'ซานอินเจียว', nameCn: '三阴交', meridian: 'Spleen', bodyRegion: 'leg', locationDescription: 'เหนือตาตุ่มใน 3 ชุ่น', indications: ['ปัญหาประจำเดือน', 'นอนไม่หลับ', 'ย่อยอาหาร'] },
      { code: 'PC6', nameEn: 'Neiguan', nameTh: 'เน่ยกวน', nameCn: '内关', meridian: 'Pericardium', bodyRegion: 'arm', locationDescription: 'เหนือข้อมือด้านใน 2 ชุ่น', indications: ['คลื่นไส้', 'ใจสั่น', 'นอนไม่หลับ'] },
      { code: 'HT7', nameEn: 'Shenmen', nameTh: 'เสินเหมิน', nameCn: '神门', meridian: 'Heart', bodyRegion: 'arm', locationDescription: 'รอยพับข้อมือด้านใน', indications: ['นอนไม่หลับ', 'วิตกกังวล', 'ใจสั่น'] },
      { code: 'LV3', nameEn: 'Taichong', nameTh: 'ไท่ชง', nameCn: '太冲', meridian: 'Liver', bodyRegion: 'foot', locationDescription: 'ระหว่างนิ้วเท้า 1-2', indications: ['ปวดศีรษะ', 'ตาแดง', 'ความเครียด', 'ความดันสูง'] },
      { code: 'KI3', nameEn: 'Taixi', nameTh: 'ไท่ซี', nameCn: '太溪', meridian: 'Kidney', bodyRegion: 'foot', locationDescription: 'ระหว่างตาตุ่มในกับเอ็นร้อยหวาย', indications: ['ปวดเอว', 'หูอื้อ', 'นอนไม่หลับ', 'บำรุงไต'] },
      { code: 'BL23', nameEn: 'Shenshu', nameTh: 'เซินซู', nameCn: '肾俞', meridian: 'Bladder', bodyRegion: 'back', locationDescription: 'ข้างกระดูกสันหลัง L2', indications: ['ปวดหลัง', 'ปวดเข่า', 'บำรุงไต'] },
      { code: 'BL40', nameEn: 'Weizhong', nameTh: 'เว่ยจง', nameCn: '委中', meridian: 'Bladder', bodyRegion: 'leg', locationDescription: 'กลางข้อพับเข่า', indications: ['ปวดหลังล่าง', 'ไซอาติกา', 'ปวดขา'] },
      { code: 'GB34', nameEn: 'Yanglingquan', nameTh: 'หยางหลิงเฉวียน', nameCn: '阳陵泉', meridian: 'Gallbladder', bodyRegion: 'leg', locationDescription: 'ใต้เข่าด้านนอก', indications: ['ปวดข้างลำตัว', 'ปัญหาเอ็นและกล้ามเนื้อ'] },
      { code: 'TE5', nameEn: 'Waiguan', nameTh: 'ไว่กวน', nameCn: '外关', meridian: 'Triple Energizer', bodyRegion: 'arm', locationDescription: 'เหนือข้อมือด้านนอก 2 ชุ่น', indications: ['ปวดแขน', 'หูอื้อ', 'ไข้หวัด'] },
      { code: 'SI3', nameEn: 'Houxi', nameTh: 'โฮ่วซี', nameCn: '后溪', meridian: 'Small Intestine', bodyRegion: 'hand', locationDescription: 'ขอบมือด้านนอก', indications: ['ปวดคอ', 'ปวดหลัง'] },
    ];

    await this.acupointRepository.save(acupoints);
    console.log(`✅ Seeded ${acupoints.length} acupoints`);
  }

  private async seedHerbs() {
    const count = await this.herbRepository.count();
    if (count > 0) return;

    const herbs = [
      // Tonifying Herbs
      { code: 'HB001', nameTh: 'โสม', nameEn: 'Ginseng', nameCn: '人参', category: 'บำรุง', properties: 'อุ่น', stockQuantity: 500, reorderLevel: 100, unit: 'กรัม', unitPrice: 50 },
      { code: 'HB002', nameTh: 'ตังกุย', nameEn: 'Angelica sinensis', nameCn: '当归', category: 'บำรุงเลือด', properties: 'อุ่น', stockQuantity: 1000, reorderLevel: 200, unit: 'กรัม', unitPrice: 15 },
      { code: 'HB003', nameTh: 'หวงฉี', nameEn: 'Astragalus', nameCn: '黄芪', category: 'บำรุง', properties: 'อุ่น', stockQuantity: 800, reorderLevel: 150, unit: 'กรัม', unitPrice: 12 },
      { code: 'HB004', nameTh: 'กานเช่า', nameEn: 'Licorice', nameCn: '甘草', category: 'ปรับสมดุล', properties: 'กลาง', stockQuantity: 1500, reorderLevel: 300, unit: 'กรัม', unitPrice: 8 },
      // Clearing Heat
      { code: 'HB005', nameTh: 'หวงเหลียน', nameEn: 'Coptis', nameCn: '黄连', category: 'ขจัดความร้อน', properties: 'เย็น', stockQuantity: 400, reorderLevel: 80, unit: 'กรัม', unitPrice: 25 },
      { code: 'HB006', nameTh: 'หวงฉิน', nameEn: 'Scutellaria', nameCn: '黄芩', category: 'ขจัดความร้อน', properties: 'เย็น', stockQuantity: 600, reorderLevel: 120, unit: 'กรัม', unitPrice: 10 },
      { code: 'HB007', nameTh: 'จินอินฮวา', nameEn: 'Honeysuckle', nameCn: '金银花', category: 'ขจัดความร้อน', properties: 'เย็น', stockQuantity: 700, reorderLevel: 140, unit: 'กรัม', unitPrice: 18 },
      // Pain Relief
      { code: 'HB008', nameTh: 'ชวนซยง', nameEn: 'Ligusticum', nameCn: '川芎', category: 'เลือดไหลเวียน', properties: 'อุ่น', stockQuantity: 500, reorderLevel: 100, unit: 'กรัม', unitPrice: 14 },
      { code: 'HB009', nameTh: 'หงฮวา', nameEn: 'Safflower', nameCn: '红花', category: 'เลือดไหลเวียน', properties: 'อุ่น', stockQuantity: 300, reorderLevel: 60, unit: 'กรัม', unitPrice: 30 },
      { code: 'HB010', nameTh: 'เถาเหริน', nameEn: 'Peach kernel', nameCn: '桃仁', category: 'เลือดไหลเวียน', properties: 'กลาง', stockQuantity: 400, reorderLevel: 80, unit: 'กรัม', unitPrice: 20 },
      // Digestive
      { code: 'HB011', nameTh: 'ซานจา', nameEn: 'Hawthorn', nameCn: '山楂', category: 'ย่อยอาหาร', properties: 'อุ่น', stockQuantity: 800, reorderLevel: 160, unit: 'กรัม', unitPrice: 8 },
      { code: 'HB012', nameTh: 'ไป๋จู๋', nameEn: 'Atractylodes', nameCn: '白术', category: 'บำรุงม้าม', properties: 'อุ่น', stockQuantity: 600, reorderLevel: 120, unit: 'กรัม', unitPrice: 12 },
      // Calming
      { code: 'HB013', nameTh: 'ซวนเจ่าเหริน', nameEn: 'Ziziphus', nameCn: '酸枣仁', category: 'สงบจิต', properties: 'กลาง', stockQuantity: 400, reorderLevel: 80, unit: 'กรัม', unitPrice: 22 },
      { code: 'HB014', nameTh: 'หลงกู่', nameEn: 'Dragon bone', nameCn: '龙骨', category: 'สงบจิต', properties: 'กลาง', stockQuantity: 300, reorderLevel: 60, unit: 'กรัม', unitPrice: 35 },
      { code: 'HB015', nameTh: 'ฝูหลิง', nameEn: 'Poria', nameCn: '茯苓', category: 'ขจัดความชื้น', properties: 'กลาง', stockQuantity: 900, reorderLevel: 180, unit: 'กรัม', unitPrice: 10 },
    ];

    await this.herbRepository.save(herbs);
    console.log(`✅ Seeded ${herbs.length} herbs`);
  }
}
