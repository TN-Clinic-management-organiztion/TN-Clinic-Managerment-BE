export class ResultImageResponseDto {
  // @ApiProperty({
  //   description: 'ID của ảnh',
  //   example: '123e4567-e89b-12d3-a456-426614174000'
  // })
  image_id: string;

  // @ApiProperty({
  //   description: 'ID của kết quả dịch vụ',
  //   example: '123e4567-e89b-12d3-a456-426614174000'
  // })
  result_id: string;

  // @ApiProperty({
  //   description: 'Public ID từ storage',
  //   example: 'result_images/xyz123'
  // })
  public_id: string;

  // @ApiProperty({
  //   description: 'URL ảnh gốc',
  //   example: 'https://example.com/image.jpg'
  // })
  original_image_url: string;

  // @ApiProperty({
  //   description: 'Tên file',
  //   example: 'diagnosis_result_1.jpg'
  // })
  file_name: string;

  // @ApiProperty({
  //   description: 'Kích thước file (bytes)',
  //   example: 2048576
  // })
  file_size: number;

  // @ApiProperty({
  //   description: 'Loại MIME',
  //   example: 'image/jpeg'
  // })
  mime_type: string;

  // @ApiProperty({
  //   description: 'Thời gian upload',
  //   example: '2024-01-15T10:30:00Z'
  // })
  uploaded_at: Date;

  // @ApiProperty({
  //   description: 'ID nhân viên upload',
  //   example: '123e4567-e89b-12d3-a456-426614174000'
  // })
  uploaded_by: string;
}