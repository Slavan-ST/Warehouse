using AutoMapper;
using WarehouseAPI.DTO;
using WarehouseAPI.Models;
using WarehouseAPI.Models.Enums;

namespace WarehouseAPI.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Resource → ResourceDto
            CreateMap<Resource, ResourceDto>();

            // UnitOfMeasure → UnitOfMeasureDto
            CreateMap<UnitOfMeasure, UnitOfMeasureDto>();

            // Balance → BalanceDto (с вложенными именами)
            CreateMap<Balance, BalanceDto>()
                .ForMember(
                    dto => dto.ResourceName,
                    opt => opt.MapFrom(b => b.Resource.Name))
                .ForMember(
                    dto => dto.UnitName,
                    opt => opt.MapFrom(b => b.UnitOfMeasure.Name));

            // ReceiptResource → ReceiptResourceDto
            CreateMap<ReceiptResource, ReceiptResourceDto>()
                .ForMember(
                    dto => dto.ResourceName,
                    opt => opt.MapFrom(rr => rr.Resource.Name))
                .ForMember(
                    dto => dto.UnitName,
                    opt => opt.MapFrom(rr => rr.UnitOfMeasure.Name));

            // ReceiptDocument → ReceiptDocumentDto
            CreateMap<ReceiptDocument, ReceiptDocumentDto>()
                .ForMember(
                    dto => dto.ReceiptResources,
                    opt => opt.MapFrom(rd => rd.ReceiptResources));

            // Client → ClientDto
            CreateMap<Client, ClientDto>();

            // ShipmentResource → ShipmentResourceDto
            CreateMap<ShipmentResource, ShipmentResourceDto>()
                .ForMember(
                    dto => dto.ResourceName,
                    opt => opt.MapFrom(sr => sr.Resource.Name))
                .ForMember(
                    dto => dto.UnitName,
                    opt => opt.MapFrom(sr => sr.UnitOfMeasure.Name));

            // ShipmentDocument → ShipmentDocumentDto
            CreateMap<ShipmentDocument, ShipmentDocumentDto>()
                .ForMember(
                    dto => dto.Client,
                    opt => opt.MapFrom(sd => sd.Client))
                .ForMember(
                    dto => dto.ShipmentResources,
                    opt => opt.MapFrom(sd => sd.ShipmentResources));
        }
    }
}