#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
RUN apt-get update \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
EXPOSE 80


FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["NghiepVu.csproj", "."]
RUN dotnet restore "./NghiepVu.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "NghiepVu.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "NghiepVu.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "NghiepVu.dll"]