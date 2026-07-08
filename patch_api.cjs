const fs = require('fs');
let content = fs.readFileSync('src/lib/supabase.ts', 'utf-8');

const apiStr = `
  async getAssetPlatforms(): Promise<any[]> {
    if (supabase && (typeof navigator === 'undefined' || navigator.onLine)) {
      try {
        const { data, error } = await supabase.from('asset_platforms').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setLocalData('ArtaQu_asset_platforms', data || []);
        return data || [];
      } catch (e) {
        return getLocalData<any[]>('ArtaQu_asset_platforms', []);
      }
    }
    return getLocalData<any[]>('ArtaQu_asset_platforms', []);
  }

  async addAssetPlatform(platform: any): Promise<{ success: boolean; data?: any; message?: string }> {
    const newId = uuidv4();
    const user = await this.getCurrentUser();
    const newPlatform = { ...platform, id: newId, user_id: user?.id, created_at: new Date().toISOString() };
    if (supabase && (typeof navigator === 'undefined' || navigator.onLine)) {
      try {
        const { data, error } = await supabase.from('asset_platforms').insert([newPlatform]).select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'Platform berhasil ditambahkan.' };
      } catch (e: any) {
        return { success: false, message: e.message || 'Gagal menambahkan platform.' };
      }
    }
    return { success: false, message: 'Offline mode not fully supported for platforms yet.' };
  }

  async updateAssetPlatform(id: string, updates: any): Promise<{ success: boolean; data?: any; message?: string }> {
    if (supabase && (typeof navigator === 'undefined' || navigator.onLine)) {
      try {
        const { data, error } = await supabase.from('asset_platforms').update(updates).eq('id', id).select();
        if (error) throw error;
        return { success: true, data: data[0], message: 'Platform diperbarui.' };
      } catch (e: any) {
        return { success: false, message: e.message || 'Gagal memperbarui platform.' };
      }
    }
    return { success: false, message: 'Offline mode not fully supported for platforms yet.' };
  }

  async deleteAssetPlatform(id: string): Promise<{ success: boolean; message?: string }> {
    if (supabase && (typeof navigator === 'undefined' || navigator.onLine)) {
      try {
        const { error } = await supabase.from('asset_platforms').delete().eq('id', id);
        if (error) throw error;
        return { success: true, message: 'Platform dihapus.' };
      } catch (e: any) {
        return { success: false, message: e.message || 'Gagal menghapus platform.' };
      }
    }
    return { success: false, message: 'Offline mode not fully supported for platforms yet.' };
  }
`;

if (!content.includes('getAssetPlatforms()')) {
  content = content.replace(/class ApiService \{/, "class ApiService {" + apiStr);
  fs.writeFileSync('src/lib/supabase.ts', content);
  console.log("Patched API service");
}
