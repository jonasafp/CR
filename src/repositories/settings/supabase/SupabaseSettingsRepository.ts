import { defaultSystemSettings, CURRENT_SETTINGS_SCHEMA_VERSION } from "../../../config/defaultSystemSettings";
import type { SystemSettings, UpdateSystemSettingsInput } from "../../../domain/settings/SystemSettings";
import { systemSettingsDtoSchema } from "../../../dtos/settings/SystemSettingsDto";
import { supabase } from "../../../lib/supabase";
import { getCurrentCompanyMembership } from "../../../services/auth/authService";
import { settingsStorageService } from "../../../services/settings/settingsStorageService";
import type { Json } from "../../../types/database.types";
import type { SettingsRepository } from "../SettingsRepository";

async function companyId(){const membership=await getCurrentCompanyMembership();if(!membership)throw new Error("Nenhuma empresa ativa foi encontrada.");return membership.company_id;}
function persist(settings:SystemSettings){settingsStorageService.save(settings);return settings;}
export class SupabaseSettingsRepository implements SettingsRepository{
 async get():Promise<SystemSettings>{const id=await companyId();const {data,error}=await supabase.from("system_settings").select("setting_value").eq("company_id",id).eq("setting_key","system").maybeSingle();if(error)throw error;if(!data)return persist({...defaultSystemSettings,updatedAt:new Date().toISOString()});const parsed=systemSettingsDtoSchema.safeParse(data.setting_value);return parsed.success?persist(parsed.data):persist({...defaultSystemSettings,updatedAt:new Date().toISOString()});}
 async update(input:UpdateSystemSettingsInput):Promise<SystemSettings>{const id=await companyId();const settings:SystemSettings={...input,schemaVersion:CURRENT_SETTINGS_SCHEMA_VERSION,updatedAt:new Date().toISOString(),updatedBy:"Administrador"};const parsed=systemSettingsDtoSchema.parse(settings);const {error}=await supabase.rpc("save_system_settings",{p_company_id:id,p_settings:parsed as unknown as Json});if(error)throw error;return persist(parsed);}
 async reset():Promise<SystemSettings>{return this.update({...defaultSystemSettings});}
}
