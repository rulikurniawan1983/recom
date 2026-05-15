const code = `
<div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-lg shadow-2xl">
        <div className="flex justify-between items-start p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Detail Permohonan</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 bg-gray-900">
          <div className="space-y-6 text-gray-200">
            <h3>Reg Info</h3>
            {isEditing && (
              <div className="space-y-4">
                <><div>NKV form</div></>
              </div>
            )}
            <div>
              <h3>Docs</h3>
              <div>{reg.type==='NKV'?(reg.recommendation_file_url?<a href={reg.recommendation_file_url}>Rec</a>:'Belum'):reg.type==='Dokter Hewan'?(reg.color_photo_url?<div className="space-y-1">{<div>Dokumen</div>}</div>:'Belum'):reg.type==='Veterinary'?(reg.recommendation_file_url?<a href={reg.recommendation_file_url}>Rec</a>:'Belum'):'Belum')}</div>
            </div>
            <div className="p-6 bg-gray-800 border-t border-gray-700 flex flex-wrap gap-2 justify-end">
              <Button>Tutup</Button>
              {isEditing && (<><Button>Simpan</Button><Button>Batal</Button></>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );\`;

// Remove comments
const cleaned = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
let b = 0, p = 0;
for (const ch of cleaned) {
  if (ch === '{') b++;
  if (ch === '}') b--;
  if (ch === '(') p++;
  if (ch === ')') p--;
}
console.log('Brace depth:', b);
console.log('Paren depth:', p);
