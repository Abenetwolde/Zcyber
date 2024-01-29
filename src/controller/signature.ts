import { Request, Response } from 'express';
import  {Signature, SignatureType} from '../model/siginature.model';
import fs from 'fs';

 
export const createSignature = async (req: Request, res: Response) => {
  console.log("reach create createSignature")
  try {
    if (!req.files || req.files.length === 0) {
      res.status(400).json({ message: 'No files uploaded' });
      return;
    }

  
    const { newSignatures, existingHashes } = await extractAndSaveSignatures(req.files as Express.Multer.File[]);

    let responseMessage = 'Files processed successfully';
    if (existingHashes.length > 0) {
      responseMessage = 'Hashes already exist and are checked';
    }

   
    res.status(200).json({ message: responseMessage, newSignatures, existingHashes });
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error!' });
  }
  async function extractAndSaveSignatures(files: Express.Multer.File[]): Promise<{ newSignatures: any[], existingHashes: string[] }> {
    const newSignatures: any[] = [];
    const existingHashes: string[] = [];
  
    for (const file of files) {
      const fileContent = fs.readFileSync(file.path, 'utf-8');
      const hashes = fileContent.split('\n').filter(Boolean);
      for (const hash of hashes) {
        const signatureType = determineSignatureType(hash);
        const result = await saveSignatureToDatabase(signatureType);
  
        if (result.existingHash) {
          existingHashes.push(result.existingHash);
        } else {
          newSignatures.push({ hash: signatureType.hash, type: signatureType.type, fileDetails: file });
        }
      }
      fs.unlinkSync(file.path);
    }
  
    return { newSignatures, existingHashes };
  }
  
  async function saveSignatureToDatabase(signatureType: { hash: string; type: SignatureType }): Promise<{ existingHash: string | null }> {
    const { hash, type } = signatureType;
    const existingSignature = await Signature.findOne({ hash });
  
    if (existingSignature) {
      if (!existingSignature.checked) {
        existingSignature.fileCount++;
        existingSignature.checked = true;
        await existingSignature.save();
      }
      return { existingHash: hash };
    }
  
    const newSignature = new Signature({
      hash,
      type,
      checked: true, 
      source: 'YourSource',
      family: 'YourFamily',
    });
    await newSignature.save();
  
    return { existingHash: null };
  }

function determineSignatureType(fileContent: string): { hash: string; type: SignatureType } {
  const md5Regex = /\b([a-fA-F0-9]{32})\b/;
  const sha1Regex = /\b([a-fA-F0-9]{40})\b/;
  const sha256Regex = /\b([a-fA-F0-9]{64})\b/;

  const md5Match = fileContent.match(md5Regex);
  if (md5Match) {
    return { hash: md5Match[1], type: SignatureType.MD5 };
  }

  const sha1Match = fileContent.match(sha1Regex);
  if (sha1Match) {
    return { hash: sha1Match[1], type: SignatureType.SHA1 };
  }

  const sha256Match = fileContent.match(sha256Regex);
  if (sha256Match) {
    return { hash: sha256Match[1], type: SignatureType.SHA256 };
  }

  return { hash: '', type: SignatureType.Unknown };
}

    
}
export const fetchAndSaveHashes = async (req: Request, res: Response) => {
  console.log("reach create fetchAndSaveHashes")
  try {
    // Fetch hashes with isRead set to false
    const unreachedSignatures = await Signature.find({ isRead: false });

    if (unreachedSignatures.length === 0) {
      return res.status(200).json({ message: 'No unreached hashes found' });
    }

    const hashFilePath = 'daily.hsb';
    const hashFileContent = unreachedSignatures.map((signature, index) => {
      const random5DigitNumber = Math.floor(10000 + Math.random() * 90000); // Generate a random 5-digit number
      const separator = index === 0 ? '' : '\n'; // Add newline if not the first hash
      return `${separator}${signature.hash}:${random5DigitNumber}:generic:${signature.type}`;
    }).join(''); 
     
    fs.appendFileSync(hashFilePath, `\n${hashFileContent}`);
 
    const updateResult = await Signature.updateMany({ _id: { $in: unreachedSignatures.map((signature) => signature._id) } }, { isRead: true });

    res.status(200).json({ message: `Hashes written to ${hashFilePath}. Updated ${updateResult} records.` });
  } catch (error:any) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error!', error: error?.message });
  }
};