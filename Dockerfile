# ----- AŞAMA 1: Build Ortamı (Build Stage) -----
# .NET SDK'sını içeren bir base imajı kullan
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Çalışma dizinini ayarla
WORKDIR /src

# Proje dosyasını kopyala ve restore et (bağımlılıkları yükle)
COPY ["furkan.csproj", "furkan/"]
RUN dotnet restore "furkan/furkan.csproj"

# Tüm proje dosyalarını kopyala
COPY . .

# Çalışma dizinini proje klasörüne ayarla
WORKDIR "/src/furkan"

# Projeyi yayınla (release modunda, çıktı 'app' klasörüne)
RUN dotnet publish "furkan.csproj" -c Release -o /app/publish

# ----- AŞAMA 2: Çalışma Ortamı (Runtime Stage) -----
# Sadece uygulamayı çalıştırmak için gerekli olan .NET Runtime imajını kullan
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

# Çalışma dizinini ayarla
WORKDIR /app

# Yayınlanmış çıktıları önceki aşamadan kopyala
COPY --from=build /app/publish .

# Ortam değişkeni ile portu ayarla (Render için gerekli)
ENV ASPNETCORE_URLS=http://+:$PORT

# Uygulamayı başlat
ENTRYPOINT ["dotnet", "furkan.dll"]