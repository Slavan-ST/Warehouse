// Mapping/MappingProfile.cs
using AutoMapper;
using WarehouseAPI.DTO;
using WarehouseAPI.Models;

namespace WarehouseAPI.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Resource, ResourceDto>();
            CreateMap<UnitOfMeasure, UnitOfMeasureDto>();
            CreateMap<Client, ClientDto>();

            CreateMap<Balance, BalanceDto>()
                .ForMember(dto => dto.ResourceName, opt => opt.MapFrom(b => b.Resource.Name))
                .ForMember(dto => dto.UnitName, opt => opt.MapFrom(b => b.UnitOfMeasure.Name));

            CreateMap<ReceiptResource, ReceiptResourceDto>()
                .ForMember(dto => dto.ResourceName, opt => opt.MapFrom(rr => rr.Resource.Name))
                .ForMember(dto => dto.UnitName, opt => opt.MapFrom(rr => rr.UnitOfMeasure.Name));

            CreateMap<ReceiptDocument, ReceiptDocumentDto>()
                .ForMember(dto => dto.ReceiptResources, opt => opt.MapFrom(rd => rd.ReceiptResources));

            CreateMap<ShipmentResource, ShipmentResourceDto>()
                .ForMember(dto => dto.ResourceName, opt => opt.MapFrom(sr => sr.Resource.Name))
                .ForMember(dto => dto.UnitName, opt => opt.MapFrom(sr => sr.UnitOfMeasure.Name));

            CreateMap<ShipmentDocument, ShipmentDocumentDto>()
                .ForMember(dto => dto.Client, opt => opt.MapFrom(sd => sd.Client))
                .ForMember(dto => dto.ShipmentResources, opt => opt.MapFrom(sd => sd.ShipmentResources));
        }
    }
}