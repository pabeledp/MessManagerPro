import { supabase } from './supabase';
import { Mess, Member, BazarEntry, MealLog, RentPayment, MessData } from '@/types/mess';

export interface RemoteMessPayload {
  messes: Mess[];
  members: Member[];
  bazars: BazarEntry[];
  meals: MealLog[];
  rentPayments: RentPayment[];
}

/**
 * Fetch all records for a specific mess by ID or Mess Code from Supabase
 */
export async function fetchRemoteMessData(messIdOrCode: string): Promise<{
  success: boolean;
  mess?: Mess;
  members?: Member[];
  bazars?: BazarEntry[];
  meals?: MealLog[];
  rentPayments?: RentPayment[];
  error?: string;
}> {
  try {
    const cleanLookup = messIdOrCode.trim().toUpperCase();

    // 1. Fetch Mess
    let query = supabase.from('messes').select('*');
    if (cleanLookup.startsWith('MESS-')) {
      query = query.ilike('code', cleanLookup);
    } else {
      query = query.or(`id.eq.${messIdOrCode},code.ilike.${cleanLookup}`);
    }

    const { data: messRows, error: messErr } = await query.limit(1);

    if (messErr) {
      console.warn('Supabase fetch error (messes):', messErr.message);
      return { success: false, error: messErr.message };
    }

    if (!messRows || messRows.length === 0) {
      return { success: false, error: 'মেস খুঁজে পাওয়া যায়নি।' };
    }

    const messRow = messRows[0];
    const targetMessId = messRow.id;

    const mess: Mess = {
      id: messRow.id,
      code: messRow.code,
      name: messRow.name,
      address: messRow.address || '',
      createdByUserId: messRow.created_by_user_id,
      monthlyHouseRent: Number(messRow.monthly_house_rent || 0),
      createdAt: messRow.created_at,
    };

    // 2. Fetch Members, Bazars, Meals, Rent
    const [
      { data: memberRows },
      { data: bazarRows },
      { data: mealRows },
      { data: rentRows },
    ] = await Promise.all([
      supabase.from('members').select('*').eq('mess_id', targetMessId),
      supabase.from('bazars').select('*').eq('mess_id', targetMessId).order('date', { ascending: false }),
      supabase.from('meals').select('*').eq('mess_id', targetMessId),
      supabase.from('rent_payments').select('*').eq('mess_id', targetMessId),
    ]);

    const members: Member[] = (memberRows || []).map((m: any) => ({
      id: m.id,
      messId: m.mess_id,
      userId: m.user_id,
      name: m.name,
      phone: m.phone,
      role: m.role || 'MEMBER',
      deposit: Number(m.deposit || 0),
      monthlyRent: Number(m.monthly_rent || 0),
    }));

    const bazars: BazarEntry[] = (bazarRows || []).map((b: any) => ({
      id: b.id,
      messId: b.mess_id,
      spentByMemberId: b.spent_by_member_id,
      amount: Number(b.amount || 0),
      category: b.category,
      date: typeof b.date === 'string' ? b.date.split('T')[0] : b.date,
      itemsNote: b.items_note || '',
      addedToDeposit: b.added_to_deposit ?? true,
    }));

    const meals: MealLog[] = (mealRows || []).map((ml: any) => ({
      date: typeof ml.date === 'string' ? ml.date.split('T')[0] : ml.date,
      messId: ml.mess_id,
      memberId: ml.member_id,
      breakfast: Number(ml.breakfast || 0),
      lunch: Number(ml.lunch || 0),
      dinner: Number(ml.dinner || 0),
    }));

    const rentPayments: RentPayment[] = (rentRows || []).map((r: any) => ({
      id: r.id,
      messId: r.mess_id,
      memberId: r.member_id,
      month: r.month,
      expectedAmount: Number(r.expected_amount || 0),
      paidAmount: Number(r.paid_amount || 0),
      status: r.status || 'unpaid',
      paidAt: r.paid_at,
      paymentMethod: r.payment_method,
      note: r.note,
    }));

    return {
      success: true,
      mess,
      members,
      bazars,
      meals,
      rentPayments,
    };
  } catch (err: any) {
    console.error('Error fetching remote mess:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Upsert entire mess state to Supabase
 */
export async function pushMessToSupabase(mess: Mess, members: Member[], bazars: BazarEntry[], meals: MealLog[], rentPayments: RentPayment[]) {
  try {
    // 1. Upsert Mess
    await supabase.from('messes').upsert({
      id: mess.id,
      code: mess.code,
      name: mess.name,
      address: mess.address,
      created_by_user_id: mess.createdByUserId,
      monthly_house_rent: mess.monthlyHouseRent,
      created_at: mess.createdAt,
    });

    // 2. Upsert Members
    if (members.length > 0) {
      await supabase.from('members').upsert(
        members.map(m => ({
          id: m.id,
          mess_id: m.messId,
          user_id: m.userId,
          name: m.name,
          phone: m.phone,
          role: m.role,
          deposit: m.deposit,
          monthly_rent: m.monthlyRent,
        }))
      );
    }

    // 3. Upsert Bazars
    if (bazars.length > 0) {
      await supabase.from('bazars').upsert(
        bazars.map(b => ({
          id: b.id,
          mess_id: b.messId,
          spent_by_member_id: b.spentByMemberId,
          amount: b.amount,
          category: b.category,
          date: b.date,
          items_note: b.itemsNote,
          added_to_deposit: b.addedToDeposit,
        }))
      );
    }

    // 4. Upsert Meals
    if (meals.length > 0) {
      await supabase.from('meals').upsert(
        meals.map(ml => ({
          id: `meal_${ml.messId}_${ml.memberId}_${ml.date}`,
          mess_id: ml.messId,
          member_id: ml.memberId,
          date: ml.date,
          breakfast: ml.breakfast,
          lunch: ml.lunch,
          dinner: ml.dinner,
        }))
      );
    }

    // 5. Upsert Rent
    if (rentPayments.length > 0) {
      await supabase.from('rent_payments').upsert(
        rentPayments.map(r => ({
          id: r.id,
          mess_id: r.messId,
          member_id: r.memberId,
          month: r.month,
          expected_amount: r.expectedAmount,
          paid_amount: r.paidAmount,
          status: r.status,
          paid_at: r.paidAt,
          payment_method: r.paymentMethod,
          note: r.note,
        }))
      );
    }
  } catch (err) {
    console.warn('Supabase push skipped/failed:', err);
  }
}
