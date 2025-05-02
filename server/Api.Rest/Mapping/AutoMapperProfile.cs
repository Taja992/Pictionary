using AutoMapper;
using Api.Rest.DTOs.Game;
using Core.Domain.Entities;

namespace Api.Rest.Mapping;

public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        // Game mappings
        CreateMap<Game, GameDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.Scores, opt => opt.MapFrom(src => 
                src.Scores
                    .GroupBy(s => s.UserId)
                    .Select(g => new ScoreDto
                    {
                        UserId = g.Key,
                        Username = g.First().User != null ? g.First().User.Username : "Unknown",
                        Points = g.Sum(s => s.Points),
                    })
                    .ToList()
            ));
        
        CreateMap<Score, ScoreDto>()
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : "Unknown"));

    }
}