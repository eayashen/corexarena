import { Slot } from "@/models/Slot";
import { Setting } from "@/models/Setting";
import { Admin } from "@/models/Admin";
import { hashPassword } from "@/lib/auth/jwt";

export const DEFAULT_SLOTS = [
  // Day Slots (7)
  {
    slotId: "day-1",
    slotType: "DAY" as const,
    label: "6:00 AM – 7:30 AM",
    startTime: "06:00",
    endTime: "07:30",
    regularPrice: 2500,
    discountedPrice: 2000,
    active: true,
    order: 1,
  },
  {
    slotId: "day-2",
    slotType: "DAY" as const,
    label: "7:30 AM – 9:00 AM",
    startTime: "07:30",
    endTime: "09:00",
    regularPrice: 2500,
    discountedPrice: 2000,
    active: true,
    order: 2,
  },
  {
    slotId: "day-3",
    slotType: "DAY" as const,
    label: "9:00 AM – 10:30 AM",
    startTime: "09:00",
    endTime: "10:30",
    regularPrice: 2500,
    discountedPrice: 2000,
    active: true,
    order: 3,
  },
  {
    slotId: "day-4",
    slotType: "DAY" as const,
    label: "10:30 AM – 12:30 PM",
    startTime: "10:30",
    endTime: "12:30",
    regularPrice: 2500,
    discountedPrice: 2000,
    active: true,
    order: 4,
  },
  {
    slotId: "day-5",
    slotType: "DAY" as const,
    label: "12:00 PM – 1:30 PM",
    startTime: "12:00",
    endTime: "13:30",
    regularPrice: 2500,
    discountedPrice: 2000,
    active: true,
    order: 5,
  },
  {
    slotId: "day-6",
    slotType: "DAY" as const,
    label: "1:30 PM – 3:00 PM",
    startTime: "13:30",
    endTime: "15:00",
    regularPrice: 2500,
    discountedPrice: 2000,
    active: true,
    order: 6,
  },
  {
    slotId: "day-7",
    slotType: "DAY" as const,
    label: "3:00 PM – 4:30 PM",
    startTime: "15:00",
    endTime: "16:30",
    regularPrice: 2500,
    discountedPrice: 2000,
    active: true,
    order: 7,
  },

  // Night Slots (6)
  {
    slotId: "night-1",
    slotType: "NIGHT" as const,
    label: "5:00 PM – 6:30 PM",
    startTime: "17:00",
    endTime: "18:30",
    regularPrice: 4500,
    discountedPrice: 4000,
    active: true,
    order: 8,
  },
  {
    slotId: "night-2",
    slotType: "NIGHT" as const,
    label: "6:30 PM – 8:00 PM",
    startTime: "18:30",
    endTime: "20:00",
    regularPrice: 4500,
    discountedPrice: 4000,
    active: true,
    order: 9,
  },
  {
    slotId: "night-3",
    slotType: "NIGHT" as const,
    label: "8:00 PM – 9:30 PM",
    startTime: "20:00",
    endTime: "21:30",
    regularPrice: 4500,
    discountedPrice: 4000,
    active: true,
    order: 10,
  },
  {
    slotId: "night-4",
    slotType: "NIGHT" as const,
    label: "9:30 PM – 11:00 PM",
    startTime: "21:30",
    endTime: "23:00",
    regularPrice: 4500,
    discountedPrice: 4000,
    active: true,
    order: 11,
  },
  {
    slotId: "night-5",
    slotType: "NIGHT" as const,
    label: "11:00 PM – 12:30 AM",
    startTime: "23:00",
    endTime: "00:30",
    regularPrice: 4500,
    discountedPrice: 4000,
    active: true,
    order: 12,
  },
  {
    slotId: "night-6",
    slotType: "NIGHT" as const,
    label: "12:30 AM – 2:00 AM",
    startTime: "00:30",
    endTime: "02:00",
    regularPrice: 4500,
    discountedPrice: 4000,
    active: true,
    order: 13,
  },
];

export async function seedDatabaseIfNeeded() {
  try {
    // 1. Seed Slots if empty
    const slotCount = await Slot.countDocuments();
    if (slotCount === 0) {
      console.log("Seeding default 13 turf slots...");
      await Slot.insertMany(DEFAULT_SLOTS);
    }

    // 2. Seed Settings if empty
    const settingCount = await Setting.countDocuments();
    if (settingCount === 0) {
      console.log("Seeding default Corex Arena settings...");
      await Setting.create({
        turfName: "Corex Arena and Academy",
        tagline: "Dhaka's Premier Football Turf & Academy",
        address: "Plot no 217, Block no B, Rd No. 4, Shagufta, Mirpur 12, Dhaka, Bangladesh, 1216",
        email: "corexarena.academy@gmail.com",
        contactNumber: "01701-275099",
        whatsappNumber: "01701-275099",
        facebookUrl: "https://www.facebook.com/profile.php?id=61591476123056",
        latitude: 23.83148397838252,
        longitude: 90.37969133511696,
        bkashNumber: "01675906833",
        requiredAdvancePayment: 500,
        scheduleChangeHoursLimit: 48,
        daySlotDefaultRegularPrice: 2500,
        daySlotDefaultDiscountedPrice: 2000,
        nightSlotDefaultRegularPrice: 4500,
        nightSlotDefaultDiscountedPrice: 4000,
      });
    }

    // 3. Seed Superadmin if not exists
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@corexarena.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "admin";
    let superAdmin = await Admin.findOne({ email: adminEmail });
    if (!superAdmin) {
      console.log(`Seeding initial superadmin account: ${adminEmail}`);
      await Admin.create({
        email: adminEmail,
        name: "Corex Arena Superadmin",
        passwordHash: hashPassword(adminPassword),
        role: "superadmin",
      });
    } else {
      superAdmin.role = "superadmin";
      superAdmin.passwordHash = hashPassword(adminPassword);
      await superAdmin.save();
    }

    // 4. Seed Viewadmin if not exists
    const viewAdminEmail = (process.env.VIEWADMIN_EMAIL || "viewadmin@corexarena.com").toLowerCase().trim();
    const viewAdminPassword = process.env.VIEWADMIN_PASSWORD || "viewadmin";
    const viewAdminExists = await Admin.findOne({ email: viewAdminEmail });
    if (!viewAdminExists) {
      console.log(`Seeding initial viewadmin account: ${viewAdminEmail}`);
      await Admin.create({
        email: viewAdminEmail,
        name: "Corex View Admin",
        passwordHash: hashPassword(viewAdminPassword),
        role: "viewadmin",
      });
    }
  } catch (error) {
    console.error("Database seeding error:", error);
  }
}

