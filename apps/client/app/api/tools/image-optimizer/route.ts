import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];
    const compressionLevel = parseInt(formData.get('compressionLevel') as string) || 80;
    const convertToWebP = formData.get('convertToWebP') === 'true';
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    const results = [];

    for (const file of files) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const originalSize = buffer.length;
        
        let sharpInstance = sharp(buffer);
        const metadata = await sharpInstance.metadata();
        
        // Apply compression and conversion
        if (convertToWebP) {
          sharpInstance = sharpInstance.webp({ quality: compressionLevel });
        } else {
          // Keep original format but apply compression
          if (metadata.format === 'jpeg') {
            sharpInstance = sharpInstance.jpeg({ quality: compressionLevel });
          } else if (metadata.format === 'png') {
            sharpInstance = sharpInstance.png({ 
              quality: compressionLevel,
              compressionLevel: Math.round(compressionLevel / 10) 
            });
          }
        }

        const optimizedBuffer = await sharpInstance.toBuffer();
        const optimizedSize = optimizedBuffer.length;
        
        // Calculate savings
        const sizeSaved = originalSize - optimizedSize;
        const percentageSaved = Math.round((sizeSaved / originalSize) * 100);
        
        // Generate filename
        const originalName = file.name.split('.')[0];
        const newExtension = convertToWebP ? 'webp' : file.name.split('.').pop();
        const optimizedName = `${originalName}_optimized.${newExtension}`;

        results.push({
          originalName: file.name,
          optimizedName,
          originalSize,
          optimizedSize,
          sizeSaved,
          percentageSaved,
          originalFormat: metadata.format,
          optimizedFormat: convertToWebP ? 'webp' : metadata.format,
          width: metadata.width,
          height: metadata.height,
          optimizedData: optimizedBuffer.toString('base64'),
          mimeType: convertToWebP ? 'image/webp' : file.type
        });

      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        results.push({
          originalName: file.name,
          error: `Failed to process image: ${(error as Error).message}`
        });
      }
    }

    // Calculate cumulative statistics
    const totalOriginalSize = results.reduce((sum, result) => sum + (result.originalSize || 0), 0);
    const totalOptimizedSize = results.reduce((sum, result) => sum + (result.optimizedSize || 0), 0);
    const totalSizeSaved = totalOriginalSize - totalOptimizedSize;
    const totalPercentageSaved = totalOriginalSize > 0 ? Math.round((totalSizeSaved / totalOriginalSize) * 100) : 0;

    return NextResponse.json({
      results,
      summary: {
        totalImages: files.length,
        successfulOptimizations: results.filter(r => !r.error).length,
        totalOriginalSize,
        totalOptimizedSize,
        totalSizeSaved,
        totalPercentageSaved
      }
    });

  } catch (error) {
    console.error('Image optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to process images' },
      { status: 500 }
    );
  }
}
