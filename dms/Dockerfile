#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["Api/DMS.Api.csproj", "Api/"]
RUN dotnet restore "Api/DMS.Api.csproj"
COPY . .
WORKDIR "/src/Api"
RUN dotnet build "DMS.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "DMS.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DMS.Api.dll"]