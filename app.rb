require 'bundler/setup'
require 'sinatra'
require 'rqrcode'
require 'chunky_png'

set :port, ENV['PORT'] || 4567
set :bind, '0.0.0.0'

get '/' do
  erb :index
end

post '/generate' do
  content = params[:content]
  color_param = params[:color] || '#000000'
  logo = params[:logo]

  begin
    # Generar nombres únicos
    timestamp = Time.now.to_i
    png_path = "public/generated_qr_#{timestamp}.png"
    svg_path = "public/generated_qr_#{timestamp}.svg"

    # Crear código QR
    qr_code = RQRCode::QRCode.new(content)
    module_size = 10
    border_size = 40
    qr_size = qr_code.modules.size * module_size
    total_size = qr_size + 2 * border_size
    qr_image = ChunkyPNG::Image.new(total_size, total_size, ChunkyPNG::Color::WHITE)

    # Preprocesar gradiente
    colors = color_param.split(',')
    gradient_mode = colors.length > 1
    gradient_cache = []

    if gradient_mode
      (0...qr_code.modules.size).each do |x|
        ratio = x.to_f / qr_code.modules.size
        r = (ChunkyPNG::Color.r(ChunkyPNG::Color.from_hex(colors[0])) * (1 - ratio) +
             ChunkyPNG::Color.r(ChunkyPNG::Color.from_hex(colors[1])) * ratio).to_i
        g = (ChunkyPNG::Color.g(ChunkyPNG::Color.from_hex(colors[0])) * (1 - ratio) +
             ChunkyPNG::Color.g(ChunkyPNG::Color.from_hex(colors[1])) * ratio).to_i
        b = (ChunkyPNG::Color.b(ChunkyPNG::Color.from_hex(colors[0])) * (1 - ratio) +
             ChunkyPNG::Color.b(ChunkyPNG::Color.from_hex(colors[1])) * ratio).to_i
        gradient_cache << ChunkyPNG::Color.rgb(r, g, b)
      end
    else
      gradient_cache << ChunkyPNG::Color.from_hex(colors[0])
    end

    # Dibujar QR con colores preprocesados
    qr_code.modules.each_with_index do |row, y|
      row.each_with_index do |cell, x|
        next unless cell
        color = gradient_mode ? gradient_cache[x] : gradient_cache[0]
        (0...module_size).each do |dy|
          (0...module_size).each do |dx|
            qr_image[x * module_size + dx + border_size, y * module_size + dy + border_size] = color
          end
        end
      end
    end

    # Guardar imagen PNG
    qr_image.save(png_path)

    # Generar SVG
    File.open(svg_path, 'w') { |file| file.write(qr_code.as_svg) }

    # Procesar logo si está presente
    if logo && logo[:tempfile]
      logo_image = ChunkyPNG::Image.from_file(logo[:tempfile])
      logo_size = (qr_size * 0.25).to_i
      logo_image.resample_bilinear!(logo_size, logo_size)

      x_offset = (total_size - logo_size) / 2
      y_offset = (total_size - logo_size) / 2
      qr_image.compose!(logo_image, x_offset, y_offset)
      qr_image.save(png_path)
    end

    {
      status: 'success',
      qr_image: "/generated_qr_#{timestamp}.png",
      qr_svg: "/generated_qr_#{timestamp}.svg"
    }.to_json
  rescue => e
    { status: 'error', message: e.message }.to_json
  end
end
