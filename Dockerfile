# ----- AŞAMA 1: Build Ortamı (Build Stage) -----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# SADECE furkan.csproj dosyasını çalışma dizinine kopyala ve restore et
# Bu, tüm bağımlılıkları indirir
COPY furkan.csproj .
RUN dotnet restore

# Tüm kalan proje dosyalarını kopyala
COPY . .

# Projeyi yayınla (çıktı /app/publish klasörüne)
RUN dotnet publish -c Release -o /app/publish

# ----- AŞAMA 2: Çalışma Ortamı (Runtime Stage) -----
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

# Yayınlanmış çıktıları önceki aşamadan kopyala
COPY --from=build /app/publish .

# Port ayarını yap (Render için kritik)
ENV ASPNETCORE_URLS=http://+:$PORT

# Uygulamayı başlat
# furkan.dll adının doğru olduğundan eminiz
ENTRYPOINT ["dotnet", "furkan.dll"]