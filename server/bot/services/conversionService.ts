export class ConversionService {
  static convertAobToByte(input: string): { result: string; error?: string } {
    try {
      if (!input.trim()) {
        return { result: '', error: 'No codes to convert' };
      }

      let text = input.trim();
      let array = text.split(/\s+/).filter(Boolean);
      let list: string[] = [];
      let flag = false;

      array = array.map(item => item.toUpperCase());

      // Check if already in BYTE format
      for (let item of array) {
        if (item.startsWith("0X") || item === "?" || item === "'?'") {
          flag = true;
          break;
        }
      }

      if (flag) {
        return { result: '', error: 'This text is already in BYTE format.' };
      }

      for (let item of array) {
        if (item === "??" || item === "?") {
          list.push("'?'");
        } else {
          list.push("0x" + item);
        }
      }

      const result = list.join(", ");
      return { result };
    } catch (error) {
      return { result: '', error: 'Failed to convert AOB to Byte' };
    }
  }

  static convertByteToAob(input: string): { result: string; error?: string } {
    try {
      if (!input.trim()) {
        return { result: '', error: 'No codes to convert' };
      }

      let text = input.trim();
      let array = text.split(/[,\s]+/).filter(Boolean);
      let result = "";

      for (let item of array) {
        if (item === "'?'") {
          result += "?? ";
        } else {
          let str = item.replace(/^0x/i, "");
          result += str + " ";
        }
      }

      let aobText = result.trim();

      if (aobText === text) {
        return { result: '', error: 'This text is already in AOB format.' };
      }

      return { result: aobText };
    } catch (error) {
      return { result: '', error: 'Failed to convert Byte to AOB' };
    }
  }

  static async convertFileToByteArray(buffer: Buffer, fileName: string, type: 'image' | 'font'): Promise<{ result: string; error?: string }> {
    try {
      const array = new Uint8Array(buffer);
      
      // Create byte array text
      let byteText = "";
      for (let i = 0; i < array.length; i++) {
        byteText += `0x${array[i].toString(16).padStart(2, '0')}`;
        if (i < array.length - 1) {
          byteText += `, `;
          if ((i + 1) % 16 === 0) byteText += `\n`;
        }
      }
      
      // Create full content
      const variableName = type === 'image' ? 'imageBytes' : 'fontBytes';
      const fullContent = `byte[] ${variableName} = {\n${byteText}\n};`;
      
      return { result: fullContent };
    } catch (error) {
      return { result: '', error: `Failed to convert ${type} to byte array` };
    }
  }

  static extractOffsetsFromCS(content: string): { result: string; error?: string } {
    try {
      const searchSections = [
        {
          section: "Bones - C#",
          entries: {
            "Head": "protected ITransformNode OLCJOGDHJJJ;",
            "Root": "protected ITransformNode MPJBGDJJJMJ;",
            "Spine": "protected ITransformNode HCLMADAFLPD;",
            "Hip": "protected ITransformNode CENAIGAFGAG;",
            "RightCalf": "protected ITransformNode JPBJIMCDBHN;",
            "LeftCalf": "protected ITransformNode BMGCHFGEDDA;",
            "RightFoot": "protected ITransformNode AGHJLIMNPJA;",
            "LeftFoot": "protected ITransformNode FDMBKCKMODA;",
            "LeftWrist": "protected ITransformNode GCMICMFEAKI;",
            "RightWrist": "protected ITransformNode CKABHDJDMAP;",
            "LeftHand": "protected ITransformNode KOCDBPLKMBI;",
            "LeftSholder": "protected ITransformNode LIBEIIIAGIK;",
            "RightSholder": "protected ITransformNode HDEPJIBNIIK;",
            "RightWristJoint": "protected ITransformNode NJDDAPKPILB;",
            "LeftWristJoint": "protected ITransformNode JHIBMHEMJOL;",
            "LeftElbow": "protected ITransformNode JBACCHNMGNJ;",
            "RightElbow": "protected ITransformNode FGECMMJKFNC;"
          }
        },
        {
          section: "Bones - C++",
          entries: {
            "uintptr_t Head": "protected ITransformNode OLCJOGDHJJJ;",
            "uintptr_t Root": "protected ITransformNode MPJBGDJJJMJ;",
            "uintptr_t Cuello": "protected ITransformNode HCLMADAFLPD;",
            "uintptr_t Cadera": "protected ITransformNode OLJBCONDGLO;",
            "uintptr_t HombroDerecho": "protected ITransformNode HDEPJIBNIIK;",
            "uintptr_t HombroIzquierdo": "protected ITransformNode LIBEIIIAGIK;",
            "uintptr_t CodoDerecho": "protected ITransformNode JBACCHNMGNJ;",
            "uintptr_t CodoIzquierdo": "protected ITransformNode FGECMMJKFNC;",
            "uintptr_t ManoDerecha": "protected ITransformNode GCMICMFEAKI;",
            "uintptr_t ManoIzquierda": "protected ITransformNode KOCDBPLKMBI;",
            "uintptr_t PieDerecho": "protected ITransformNode CKABHDJDMAP;",
            "uintptr_t PieIzquierdo": "protected ITransformNode FDMBKCKMODA;"
          }
        }
      ];

      let results: string[] = [];
      
      for (const section of searchSections) {
        results.push(`\n// ${section.section}\n`);
        
        for (const [key, searchPattern] of Object.entries(section.entries)) {
          // Extract the identifier from the search pattern
          const match = searchPattern.match(/protected ITransformNode ([A-Z]+);/);
          if (match) {
            const identifier = match[1];
            // Search for this identifier in the content
            const found = content.includes(identifier);
            if (found) {
              results.push(`${key}: ${identifier}`);
            }
          }
        }
      }

      if (results.length === 0) {
        return { result: '', error: 'No bone offsets found in the provided C# file.' };
      }

      return { result: results.join('\n') };
    } catch (error) {
      return { result: '', error: 'Failed to extract offsets from C# file' };
    }
  }
}
